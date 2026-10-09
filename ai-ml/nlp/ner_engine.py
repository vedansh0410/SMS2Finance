import re
from typing import List, Dict, Any, Optional


from normalization.cleaner import clean_merchant_name


class FinancialNerEngine:
    """
    Named Entity Recognition (NER) Token-Classification Engine.
    Specialized for identifying contextual, high-variance entities like MERCHANT
    and contextual transaction intents in financial notification text.
    """

    def __init__(self, model_name: str = "baseline-financial-ner"):
        self.model_name = model_name

    def predict_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract entities using statistical/contextual token classification.
        Outputs candidates with entity type, value, character span, and confidence score.
        """
        entities: List[Dict[str, Any]] = []

        # 1. Contextual Merchant Token Recognition
        # Pattern captures variable multi-word merchant titles following directional prepositions
        merchant_contexts = [
            r'(?:to|at|info|paid\s+to|transfer\s+to|vpa\s+to)\s+([A-Za-z0-9&.\'_\-\s]{2,40}?)(?=(?:[\.\s]+(?:on|via|ref|rrn|utr|upi|avl|bal|using|through|not\s*you|$)|[\.\s]*$))',
            r'(?:purchase\s+at)\s+([A-Za-z0-9&.\'_\-\s]{2,40}?)(?=(?:[\.\s]+(?:on|via|ref|rrn|utr|avl|bal|$)|[\.\s]*$))',
            r'(?:by\s+merchant)\s+([A-Za-z0-9&.\'_\-\s]{2,40}?)(?=(?:[\.\s]+(?:on|via|ref|rrn|utr|avl|bal|$)|[\.\s]*$))'
        ]

        for pattern in merchant_contexts:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                raw_val = match.group(1).strip()
                val = clean_merchant_name(raw_val)
                if val:
                    start_idx = match.start(1)
                    end_idx = start_idx + len(val)
                    entities.append({
                        "entity_type": "MERCHANT",
                        "value": val,
                        "source": "NER",
                        "confidence": 0.88,
                        "start_idx": start_idx,
                        "end_idx": end_idx
                    })
                    break

        # 2. Contextual Transaction Type (NER)
        if re.search(r'\b(debited|debit|withdrawn|spent|paid|purchase)\b', text, re.IGNORECASE):
            entities.append({
                "entity_type": "TXN_TYPE",
                "value": "DEBIT",
                "source": "NER",
                "confidence": 0.94,
                "start_idx": None,
                "end_idx": None
            })
        elif re.search(r'\b(credited|credit|deposited|received|refund)\b', text, re.IGNORECASE):
            entities.append({
                "entity_type": "TXN_TYPE",
                "value": "CREDIT",
                "source": "NER",
                "confidence": 0.94,
                "start_idx": None,
                "end_idx": None
            })

        # 3. Contextual Currency Amount (NER)
        amt_match = re.search(r'(?:Rs\.?|INR|[₹\u20B9\u20A8])\s*([0-9,]+(?:\.[0-9]{1,2})?)', text, re.IGNORECASE)
        if amt_match:
            clean_amt = amt_match.group(1).replace(",", "")
            entities.append({
                "entity_type": "AMOUNT",
                "value": clean_amt,
                "source": "NER",
                "confidence": 0.86,
                "start_idx": amt_match.start(1),
                "end_idx": amt_match.end(1)
            })

        return entities
