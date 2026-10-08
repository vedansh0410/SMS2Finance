from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    ParseRequest,
    ParseResponse,
    EntityItem,
    DeduplicationQuery,
    DeduplicationResult
)
from rules.rule_extractor import DeterministicRuleExtractor
from nlp.ner_engine import FinancialNerEngine
from normalization.reconciliation import EntityReconciler
from deduplication.tiered_dedup import TieredDeduplicator

app = FastAPI(
    title="SMS2Finance AI/ML Information Extraction Engine",
    description="Hybrid NER and Rule-based financial transaction extraction and deduplication service",
    version="1.0.0-hybrid"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
rule_extractor = DeterministicRuleExtractor()
ner_engine = FinancialNerEngine()
reconciler = EntityReconciler(theta_ner=0.75)
deduplicator = TieredDeduplicator()


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "sms2finance-ml",
        "version": "1.0.0-hybrid",
        "description": "Hybrid information extraction combining machine-learning NER model with deterministic regex/rules"
    }


@app.post("/internal/parser/parse", response_model=ParseResponse)
def parse_sms(req: ParseRequest):
    """
    Parses a single bank SMS message using hybrid NER + Regex extraction (Algorithm 2).
    """
    if not req.message:
        raise HTTPException(status_code=400, detail="SMS message content cannot be empty")

    # 1. Deterministic extraction (Regex + Rules)
    reg_candidates = rule_extractor.extract(req.sender, req.message)

    # 2. Contextual extraction (NER token classification)
    ner_candidates = ner_engine.predict_entities(req.message)

    # 3. Conflict-Aware Entity Reconciliation (Algorithm 2)
    reconciled = reconciler.reconcile(
        e_reg=reg_candidates,
        e_ner=ner_candidates,
        timestamp=req.timestamp
    )

    entity_items = [
        EntityItem(
            entity_type=item["entity_type"],
            value=str(item["value"]),
            source=item["source"],
            confidence=float(item.get("confidence", 0.90)),
            start_idx=item.get("start_idx"),
            end_idx=item.get("end_idx")
        )
        for item in reconciled.get("entities", [])
    ]

    return ParseResponse(
        sms_id=req.sms_id,
        sender=req.sender,
        amount=reconciled.get("amount"),
        payment_date=reconciled.get("payment_date"),
        rrn=reconciled.get("rrn"),
        account_last_four=reconciled.get("account_last_four"),
        transaction_type=reconciled.get("transaction_type"),
        bank_balance=reconciled.get("bank_balance"),
        bank_name=reconciled.get("bank_name"),
        merchant=reconciled.get("merchant"),
        upi_id=reconciled.get("upi_id"),
        extraction_confidence=reconciled.get("extraction_confidence", 0.0),
        parser_version="1.0.0-hybrid",
        validation_status=reconciled.get("validation_status", "VALID"),
        entities=entity_items
    )


@app.post("/internal/parser/deduplicate", response_model=DeduplicationResult)
def evaluate_deduplication(query: DeduplicationQuery):
    """
    Evaluates whether a new transaction is a duplicate using Tiered Deduplication (Algorithm 3).
    """
    decision, reason, matched_id, score = deduplicator.evaluate_duplicate(
        new_txn=query.new_transaction,
        existing_txns=query.existing_transactions
    )

    return DeduplicationResult(
        decision=decision,
        reason=reason,
        matched_id=matched_id,
        similarity_score=score
    )
