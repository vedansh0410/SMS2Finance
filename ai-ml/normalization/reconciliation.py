from typing import List, Dict, Any, Optional
import datetime
from normalization.cleaner import clean_merchant_name


class EntityReconciler:
    """
    Implements Algorithm 2: Conflict-Aware Entity Reconciliation.
    Fuses deterministic regex candidates with contextual NER candidates
    according to architectural priority rules.
    """

    def __init__(self, theta_ner: float = 0.75):
        self.theta_ner = theta_ner

    def reconcile(
        self,
        e_reg: List[Dict[str, Any]],
        e_ner: List[Dict[str, Any]],
        timestamp: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Reconciles candidate entities from deterministic regex and contextual NER.
        """
        # Group candidates by type
        reg_map = {item["entity_type"]: item for item in e_reg}
        ner_map = {item["entity_type"]: item for item in e_ner}

        e_final: Dict[str, Any] = {}
        all_entities: List[Dict[str, Any]] = []

        # 1. Deterministic priority for strict structural entities: {AMOUNT, RRN, ACC_NUM, UPI_ID, BALANCE, BANK_NAME}
        deterministic_types = ["AMOUNT", "RRN", "ACC_NUM", "UPI_ID", "BALANCE", "BANK_NAME"]
        for entity_type in deterministic_types:
            chosen = None
            if entity_type in reg_map:
                chosen = reg_map[entity_type]
            elif entity_type in ner_map and ner_map[entity_type].get("confidence", 0) >= self.theta_ner:
                chosen = ner_map[entity_type]

            if chosen:
                e_final[entity_type] = chosen["value"]
                all_entities.append(chosen)

        # 2. Contextual priority for variable entities: {MERCHANT, TXN_TYPE}
        contextual_types = ["MERCHANT", "TXN_TYPE"]
        for entity_type in contextual_types:
            chosen = None
            if entity_type == "MERCHANT":
                ner_cand = ner_map.get(entity_type)
                reg_cand = reg_map.get(entity_type)
                if ner_cand and ner_cand.get("confidence", 0) >= self.theta_ner:
                    clean_v = clean_merchant_name(ner_cand.get("value"))
                    if clean_v:
                        chosen = dict(ner_cand)
                        chosen["value"] = clean_v
                if not chosen and reg_cand:
                    clean_v = clean_merchant_name(reg_cand.get("value"))
                    if clean_v:
                        chosen = dict(reg_cand)
                        chosen["value"] = clean_v
            else:
                if entity_type in ner_map and ner_map[entity_type].get("confidence", 0) >= self.theta_ner:
                    chosen = ner_map[entity_type]
                elif entity_type in reg_map:
                    chosen = reg_map[entity_type]

            if chosen:
                e_final[entity_type] = chosen["value"]
                all_entities.append(chosen)

        # 3. Normalize values and validate
        normalized = self._validate_and_normalize(e_final, timestamp)
        normalized["entities"] = all_entities
        return normalized

    def _validate_and_normalize(
        self,
        e_final: Dict[str, Any],
        timestamp: Optional[int] = None
    ) -> Dict[str, Any]:
        result: Dict[str, Any] = {}

        # Amount normalization
        amount_val = None
        if "AMOUNT" in e_final:
            try:
                amount_val = round(float(str(e_final["AMOUNT"]).replace(",", "")), 2)
            except ValueError:
                amount_val = None
        result["amount"] = amount_val

        # Payment date normalization
        payment_date = None
        if timestamp and timestamp > 0:
            try:
                # Format to ISO 8601 string
                dt = datetime.datetime.fromtimestamp(timestamp / 1000.0, tz=datetime.timezone.utc)
                payment_date = dt.isoformat()
            except Exception:
                payment_date = None
        result["payment_date"] = payment_date

        # RRN normalization
        result["rrn"] = e_final.get("RRN")

        # Account last four digits normalization
        acc = e_final.get("ACC_NUM")
        if acc:
            digits_only = "".join(ch for ch in str(acc) if ch.isdigit())
            result["account_last_four"] = digits_only[-4:] if len(digits_only) >= 4 else digits_only
        else:
            result["account_last_four"] = None

        # Transaction type normalization (DEBIT / CREDIT)
        txn_type = e_final.get("TXN_TYPE")
        if txn_type:
            txn_upper = txn_type.upper()
            if "DEBIT" in txn_upper:
                result["transaction_type"] = "DEBIT"
            elif "CREDIT" in txn_upper:
                result["transaction_type"] = "CREDIT"
            else:
                result["transaction_type"] = "UNKNOWN"
        else:
            result["transaction_type"] = "UNKNOWN"

        # Bank balance normalization
        bal_val = None
        if "BALANCE" in e_final:
            try:
                bal_val = round(float(str(e_final["BALANCE"]).replace(",", "")), 2)
            except ValueError:
                bal_val = None
        result["bank_balance"] = bal_val

        # Bank Name
        result["bank_name"] = e_final.get("BANK_NAME")

        # Merchant normalization
        merchant = e_final.get("MERCHANT")
        cleaned_merchant = clean_merchant_name(merchant) if merchant else None
        result["merchant"] = cleaned_merchant

        # UPI ID normalization
        result["upi_id"] = e_final.get("UPI_ID")

        # Extraction confidence computation
        conf_scores = [0.85]  # baseline
        if result["amount"] is not None:
            conf_scores.append(0.95)
        if result["transaction_type"] in {"DEBIT", "CREDIT"}:
            conf_scores.append(0.92)
        if result["rrn"] is not None:
            conf_scores.append(0.98)
        if result["merchant"] is not None:
            conf_scores.append(0.88)

        result["extraction_confidence"] = round(sum(conf_scores) / len(conf_scores), 2)

        # Validation status
        if result["amount"] is not None and result["transaction_type"] in {"DEBIT", "CREDIT"}:
            result["validation_status"] = "VALID"
        elif result["amount"] is not None:
            result["validation_status"] = "INCOMPLETE"
        else:
            result["validation_status"] = "REJECTED"

        return result
