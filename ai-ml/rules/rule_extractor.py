import re
from typing import List, Dict, Any, Optional
from rules.regex_catalog import (
    AMOUNT_PATTERNS,
    RRN_PATTERNS,
    ACCOUNT_PATTERNS,
    DEBIT_PATTERN,
    CREDIT_PATTERN,
    UPI_ID_PATTERN,
    BALANCE_PATTERNS,
    MERCHANT_RULE_PATTERNS,
    BANK_HEADER_MAP,
)


from normalization.cleaner import clean_merchant_name


class DeterministicRuleExtractor:
    """
    Deterministic regex and rule-based extractor for structural financial entities.
    Notice: Regex is NOT a machine-learning model; it provides rigid, exact pattern matching.
    """

    def extract(self, sender: str, message: str) -> List[Dict[str, Any]]:
        candidates: List[Dict[str, Any]] = []

        # 1. Bank Name from Sender or Message
        bank_name = self._identify_bank(sender, message)
        if bank_name:
            candidates.append({
                "entity_type": "BANK_NAME",
                "value": bank_name,
                "source": "RULE",
                "confidence": 0.99,
                "start_idx": None,
                "end_idx": None
            })

        # 2. Bank Balance Pattern check first (so balance amount is disambiguated from transaction amount)
        balance_match_span = None
        for pat in BALANCE_PATTERNS:
            m = pat.search(message)
            if m and m.group(1):
                clean_val = m.group(1).replace(",", "")
                candidates.append({
                    "entity_type": "BALANCE",
                    "value": clean_val,
                    "source": "REGEX",
                    "confidence": 0.95,
                    "start_idx": m.start(1),
                    "end_idx": m.end(1)
                })
                balance_match_span = (m.start(), m.end())
                break

        # 3. Transaction Amount Extraction
        for pat in AMOUNT_PATTERNS:
            for m in pat.finditer(message):
                # Ensure this span is not inside the balance match span
                if balance_match_span and (balance_match_span[0] <= m.start() <= balance_match_span[1]):
                    continue
                val = m.group(1).replace(",", "").strip()
                if val:
                    try:
                        # Validate as positive float
                        float(val)
                        candidates.append({
                            "entity_type": "AMOUNT",
                            "value": val,
                            "source": "REGEX",
                            "confidence": 0.95,
                            "start_idx": m.start(1),
                            "end_idx": m.end(1)
                        })
                        break
                    except ValueError:
                        pass
            if any(c["entity_type"] == "AMOUNT" for c in candidates):
                break

        # 4. RRN / Reference Extraction
        for pat in RRN_PATTERNS:
            m = pat.search(message)
            if m:
                val = m.group(1).strip()
                candidates.append({
                    "entity_type": "RRN",
                    "value": val,
                    "source": "REGEX",
                    "confidence": 0.98,
                    "start_idx": m.start(1),
                    "end_idx": m.end(1)
                })
                break

        # 5. Account Number Last 4 Digits
        for pat in ACCOUNT_PATTERNS:
            m = pat.search(message)
            if m:
                val = m.group(1).strip()
                candidates.append({
                    "entity_type": "ACC_NUM",
                    "value": val,
                    "source": "REGEX",
                    "confidence": 0.97,
                    "start_idx": m.start(1),
                    "end_idx": m.end(1)
                })
                break

        # 6. UPI ID
        m_upi = UPI_ID_PATTERN.search(message)
        if m_upi:
            val = m_upi.group(1).strip()
            candidates.append({
                "entity_type": "UPI_ID",
                "value": val,
                "source": "REGEX",
                "confidence": 0.96,
                "start_idx": m_upi.start(1),
                "end_idx": m_upi.end(1)
            })

        # 7. Transaction Type (DEBIT / CREDIT)
        if DEBIT_PATTERN.search(message):
            candidates.append({
                "entity_type": "TXN_TYPE",
                "value": "DEBIT",
                "source": "RULE",
                "confidence": 0.95,
                "start_idx": None,
                "end_idx": None
            })
        elif CREDIT_PATTERN.search(message):
            candidates.append({
                "entity_type": "TXN_TYPE",
                "value": "CREDIT",
                "source": "RULE",
                "confidence": 0.95,
                "start_idx": None,
                "end_idx": None
            })

        # 8. Merchant Heuristic Rule Extraction
        for pat in MERCHANT_RULE_PATTERNS:
            m = pat.search(message)
            if m:
                raw_merchant = m.group(1).strip()
                clean_m = clean_merchant_name(raw_merchant)
                if clean_m:
                    start_idx = m.start(1)
                    end_idx = start_idx + len(clean_m)
                    candidates.append({
                        "entity_type": "MERCHANT",
                        "value": clean_m,
                        "source": "RULE",
                        "confidence": 0.75,
                        "start_idx": start_idx,
                        "end_idx": end_idx
                    })
                    break

        return candidates

    def _identify_bank(self, sender: str, message: str = "") -> Optional[str]:
        upper_sender = (sender or "").upper()
        for key, name in BANK_HEADER_MAP.items():
            if key in upper_sender:
                return name
        upper_msg = (message or "").upper()
        if "INDIAN BANK" in upper_msg or "INDBNK" in upper_msg:
            return "Indian Bank"
        for key, name in BANK_HEADER_MAP.items():
            if key in upper_msg:
                return name
        return None
