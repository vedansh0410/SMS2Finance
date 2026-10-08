from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ParseRequest(BaseModel):
    sms_id: Optional[int] = None
    sender: str
    message: str
    timestamp: int


class EntityItem(BaseModel):
    entity_type: str
    value: str
    source: str  # REGEX, NER, RULE, RECONCILED
    confidence: float
    start_idx: Optional[int] = None
    end_idx: Optional[int] = None


class ParseResponse(BaseModel):
    sms_id: Optional[int] = None
    sender: str
    amount: Optional[float] = None
    payment_date: Optional[str] = None
    rrn: Optional[str] = None
    account_last_four: Optional[str] = None
    transaction_type: Optional[str] = None  # DEBIT, CREDIT, UNKNOWN
    bank_balance: Optional[float] = None
    bank_name: Optional[str] = None
    merchant: Optional[str] = None
    upi_id: Optional[str] = None
    extraction_confidence: float = 0.0
    parser_version: str = "1.0.0-hybrid"
    validation_status: str = "VALID"  # VALID, INCOMPLETE, REJECTED
    entities: List[EntityItem] = Field(default_factory=list)


class DeduplicationQuery(BaseModel):
    new_transaction: Dict[str, Any]
    existing_transactions: List[Dict[str, Any]]
    time_window_seconds: int = 86400  # Default 24 hours


class DeduplicationResult(BaseModel):
    decision: str  # INSERT or DUPLICATE_DROP
    reason: str
    matched_id: Optional[Any] = None
    similarity_score: Optional[float] = None
