# FinSight AI (SMS2Finance) — AI/NLP Information Extraction Specification

> **Document Scope**: Machine learning architecture, regular expression catalogs, contextual NER token classification, reconciliation logic, and provenance tracking.  
> **Source Modules**: [`rules/`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/rules), [`nlp/`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/nlp), [`normalization/`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/normalization)

---

## 1. Architectural Motivation: Why Hybrid Information Extraction?

In financial SMS mining, neither statistical token classification nor deterministic pattern matching is sufficient when deployed in isolation:

| Approach | Strengths | Failure Modes in Financial SMS |
|---|---|---|
| **Deterministic Regex Only** | 100% precision on rigid syntax; zero training overhead; sub-millisecond latency. | Complete failure when merchant names change arbitrarily; fragile against spacing and template variations. |
| **Statistical NER Only** | Robust to phrasing variations and novel merchant entity names. | Prone to numeric hallucinations, boundary clipping on 12-digit RRN strings, and decimal floating errors. |
| **Proposed Hybrid Architecture** | **Combines deterministic precision for structural values with statistical generalization for merchants.** | Resolves candidate conflicts via domain priority rules (Algorithm 2). |

---

## 2. Component 1: Deterministic Regex Catalog (`rules/`)

Implemented in [`rules/regex_catalog.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/rules/regex_catalog.py) and [`rules/rule_extractor.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/rules/rule_extractor.py):

### 2.1 Currency & Monetary Amount Patterns
Matches standard Indian currency denotations including `Rs.`, `Rs`, `INR`, and the Unicode Rupee symbol `₹` (`\u20B9`):
```python
PATTERN_AMOUNT = re.compile(
    r'(?:Rs\.?|INR|[₹\u20B9\u20A8])\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)|'
    r'([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:Rs\.?|INR|[₹\u20B9\u20A8])',
    re.IGNORECASE
)
```

### 2.2 Retrieval Reference Number (RRN / UTR) Patterns
Captures standard 12-digit numeric UPI reference numbers and alphanumeric banking transaction hashes:
```python
PATTERN_RRN = re.compile(
    r'(?:UPI\s+Ref(?:\s+no)?|Ref\s+no|Ref|RRN|UTR|Txn\s+ID|txn\s+id)[\s:=]+([A-Za-z0-9]{6,20})',
    re.IGNORECASE
)
```

### 2.3 Masked Account / Card Patterns
Identifies masked account references:
```python
PATTERN_ACCOUNT = re.compile(
    r'(?:A/c|Account|Acct|card|Card)\s*(?:no\.?)?\s*(?:ending\s+in|ending|xx|\*\*|\.\.\.)?\s*([0-9Xx*]{3,16}[0-9]{3,4})',
    re.IGNORECASE
)
```

### 2.4 Virtual Payment Address (UPI VPA) Patterns
Captures standardized UPI identifiers:
```python
PATTERN_UPI_ID = re.compile(
    r'\b([a-zA-Z0-9.\-_]{2,50}@[a-zA-Z0-9]{2,30})\b',
    re.IGNORECASE
)
```

### 2.5 Post-Transaction Account Balance Patterns
Extracts remaining ledger balances:
```python
PATTERN_BALANCE = re.compile(
    r'(?:Avl\s+Bal|Available\s+Balance|Bal|Bal:)\s*(?:is)?\s*(?:Rs\.?|INR|[₹\u20B9])?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)',
    re.IGNORECASE
)
```

---

## 3. Component 2: Contextual NER Token Classification (`nlp/`)

Implemented in [`nlp/ner_engine.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/nlp/ner_engine.py):

The `FinancialNerEngine` identifies contextual tokens that cannot be captured by static regular expressions—most notably dynamic merchant names and subtle transaction intents:

### 3.1 Directional Merchant Prepositions
The engine examines directional prepositions to capture variable-length payee tokens:
```python
merchant_contexts = [
    r'(?:to|at|info|paid\s+to|transfer\s+to|vpa\s+to)\s+([A-Za-z0-9&.\'_\-\s]{2,30}?)(?:\s+(?:on|via|ref|upi|avl|bal|using|through|\.|$))',
    r'(?:purchase\s+at)\s+([A-Za-z0-9&.\'_\-\s]{2,30}?)(?:\s+(?:on|via|\.|$))',
    r'(?:by\s+merchant)\s+([A-Za-z0-9&.\'_\-\s]{2,30}?)(?:\s+(?:on|via|\.|$))'
]
```
* **Negative Stop-Word Filtering**: Eliminates false positives matching common banking words (`your`, `vpa`, `account`, `card`, `bank`, `otp`).
* **Confidence Scoring**: Assigns token confidence ($c \in [0.80, 0.95]$) and records character spans (`start_idx`, `end_idx`).

---

## 4. Component 3: Conflict-Aware Reconciliation (Algorithm 2)

Implemented in [`normalization/reconciliation.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/normalization/reconciliation.py):

When multiple extraction sources produce conflicting candidates for the same entity, the reconciler applies a **domain-informed priority hierarchy**:

```text
Deterministic Domain Priority:
1. AMOUNT, RRN, ACC_NUM, UPI_ID, BALANCE, BANK_NAME:
   -> Deterministic Regex candidate selected first (High Confidence: 0.95 - 0.99).
   -> Fallback to NER candidate only if Regex yields null AND Confidence >= theta_ner (0.75).

Contextual Domain Priority:
2. MERCHANT, TXN_TYPE:
   -> Statistical NER candidate selected first if Confidence >= theta_ner (0.75).
   -> Fallback to deterministic regex or keyword rule if NER is absent.
```

---

## 5. Provenance & Confidence Transparency

For full explainability, each extracted transaction maintains complete entity provenance:

```json
{
  "entity_type": "MERCHANT",
  "value": "Swiggy",
  "source": "NER",
  "confidence": 0.92,
  "start_idx": 36,
  "end_idx": 42
}
```

* **Overall Confidence Score**: Calculated as the weighted average of individual entity confidences.
* **Validation Status**: Classified as `VALID` if `amount`, `transaction_type`, and `bank_name` are resolved; otherwise marked `PARTIAL`.
