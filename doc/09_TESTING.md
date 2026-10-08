# FinSight AI (SMS2Finance) — Multi-Tier Testing Strategy

> **Document Scope**: Multi-tier testing methodology, test suites, edge cases, integration verification, and test execution commands.  
> **Source Test Suites**: [`ai-ml/tests/test_parser.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/tests/test_parser.py), [`sms-android/app/src/test/`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/test), [`smssyncserverBACKEND/src/test/`](file:///c:/Users/HP/Downloads/SMS2Finance/smssyncserverBACKEND/src/test)

---

## 1. Testing Pyramid Overview

FinSight AI employs a multi-tier testing strategy ensuring data consistency, extraction accuracy, and sync resilience:

```text
               ┌────────────────────────┐
               │  End-to-End Pipeline   │  Android -> Backend -> ML -> DB -> UI
               ├────────────────────────┤
               │   Integration Tests    │  Spring Boot REST & PostgreSQL / Pytest API
               ├────────────────────────┤
               │   Component Unit Tests │  Algorithm 1, 2, 3 / Regex Catalogs / NER
               └────────────────────────┘
```

---

## 2. Python AI/ML Test Suite (`ai-ml/tests/test_parser.py`)

The Python test suite validates information extraction, reconciliation heuristics, and deduplication logic:

### 2.1 Deterministic Rule Extractor Tests
Verifies regex precision against standard bank templates:
```python
def test_rule_extractor_hdfc_upi():
    extractor = DeterministicRuleExtractor()
    sender = "HDFCBK"
    msg = "Rs. 750.50 debited from A/c XX1234 to Swiggy via UPI. UPI Ref: 312345678901. Avl Bal: Rs. 14200.00."
    candidates = extractor.extract(sender, msg)
    types = {c["entity_type"]: c["value"] for c in candidates}
    assert types["BANK_NAME"] == "HDFC Bank"
    assert types["AMOUNT"] == "750.50"
    assert types["ACC_NUM"] == "1234"
    assert types["RRN"] == "312345678901"
    assert types["TXN_TYPE"] == "DEBIT"
    assert types["BALANCE"] == "14200.00"
```

### 2.2 Contextual NER Merchant Extraction Tests
Verifies payee token extraction from conversational phrasing:
```python
def test_ner_engine_merchant_extraction():
    engine = FinancialNerEngine()
    msg = "Rs. 450 debited from a/c XX5678 to Zomato on 24-03-24. Avl bal Rs 5000."
    entities = engine.predict_entities(msg)
    merchant = next((e for e in entities if e["entity_type"] == "MERCHANT"), None)
    assert merchant is not None
    assert merchant["value"] == "Zomato"
```

### 2.3 Algorithm 2 Conflict Reconciliation Tests
Ensures deterministic entities take priority over statistical NER candidates:
```python
def test_algorithm_2_entity_reconciliation():
    reconciler = EntityReconciler(theta_ner=0.75)
    # Regex candidate (high confidence) vs NER candidate (lower confidence)
    ...
    assert res["amount"] == 1500.0
    assert res["rrn"] == "987654321012"
    assert res["merchant"] == "Starbucks Coffee"
    assert res["validation_status"] == "VALID"
```

### 2.4 Algorithm 3 Tiered Deduplication Tests
Validates both Level-1 exact RRN deduplication and Level-2 temporal Jaro-Winkler fuzzy matching:
```python
def test_algorithm_3_tiered_deduplication():
    dedup = TieredDeduplicator(time_window_seconds=3600, similarity_threshold=0.85)
    # Exact RRN match -> DUPLICATE_DROP
    # Missing RRN + high merchant similarity within 1h -> DUPLICATE_DROP
    # Distinct transaction (different amount) -> INSERT
```

---

## 3. Spring Boot Backend Test Suite (`smssyncserverBACKEND/`)

Located in [`src/test/java/com/vedansh/smssyncserver/`](file:///c:/Users/HP/Downloads/SMS2Finance/smssyncserverBACKEND/src/test/java/com/vedansh/smssyncserver):

* **Context Bootstrapping**: `SmssyncserverApplicationTests.java` validates Spring ApplicationContext loading and JPA mapping integrity.
* **REST Ingestion Tests**: Validates `POST /api/sms` with valid and invalid payloads.
* **Transaction Query Tests**: Verifies query parameter handling (`bank`, `type`, `search`, `account`) in `TransactionService`.
* **Aggregation Tests**: Validates mathematical accuracy of financial summaries (`totalSpent`, `totalReceived`, `netFlow`).

---

## 4. Android Edge Test Suite (`sms-android/`)

Located in [`app/src/test/java/com/vedansh/smssync/`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/test/java/com/vedansh/smssync):

* **Edge Filter Tests (`BankSmsFilter`)**:
  - Validates bank header recognition across 30+ institution prefixes.
  - Ensures isolation of authentication OTPs without dropping security warning messages.
  - Tests currency regex matching for `Rs.`, `INR`, and Unicode `₹`.
* **Sliding Window Tests (`DateUtil`)**:
  - Ensures messages older than 30 days are rejected from the initial synchronization queue.
* **Sync Ordering & Checkpointing**:
  - Validates that messages are re-sorted chronologically ascending before transmission.
  - Verifies that `lastSync` checkpoint in `SyncPreference` is modified only after successful HTTP upload.

---

## 5. Test Execution Commands

### Run Python AI/ML Tests
```bash
cd ai-ml
python -m pytest tests/ -v
```

### Run Spring Boot Compilation & Tests
```bash
cd smssyncserverBACKEND
mvn test-compile
mvn test
```

### Run Android Unit Tests
```bash
cd sms-android
gradlew.bat test
```

### Run Benchmark Regression Evaluation
```bash
cd ai-ml
python benchmark/ablation_runner.py
```
