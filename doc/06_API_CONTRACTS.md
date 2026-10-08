# FinSight AI (SMS2Finance) — REST API Contracts

> **Document Scope**: Full HTTP API contracts, JSON request/response schemas, query parameters, status codes, and error responses.  
> **Base URLs**:  
> - Core Backend: `http://localhost:8080/api`  
> - ML Microservice: `http://localhost:8000`

---

## 1. Edge Ingestion API (`smssyncserverBACKEND`)

### 1.1 Ingest Bank SMS
* **Endpoint**: `POST /api/sms`
* **Producer**: Android Client (`SmsUploadService`)
* **Description**: Receives a single edge-filtered bank SMS, persists it to the `sms_messages` table, and immediately triggers Python ML parsing.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload
```json
{
  "sender": "HDFCBK",
  "message": "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00.",
  "timestamp": 1728212400000
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "SMS Saved"
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "timestamp": "2024-10-06T15:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: message cannot be blank"
}
```

---

### 1.2 Query Raw SMS Feed
* **Endpoint**: `GET /api/sms`
* **Consumer**: React Frontend (`SmsIngestionFeed`)
* **Description**: Returns all raw ingested messages in descending chronological order for feed monitoring.

#### Response (`200 OK`)
```json
[
  {
    "id": 101,
    "sender": "HDFCBK",
    "message": "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00.",
    "timestamp": 1728212400000,
    "processingStatus": "PARSED",
    "processingError": null,
    "createdAt": "2024-10-06T15:00:01",
    "updatedAt": "2024-10-06T15:00:02"
  }
]
```

---

## 2. Structured Transactions API (`smssyncserverBACKEND`)

### 2.1 Search & Filter Transactions
* **Endpoint**: `GET /api/transactions`
* **Query Parameters**:
  - `bank` *(optional, string)*: Filter by bank name (e.g., `HDFC Bank`, `State Bank of India`).
  - `type` *(optional, string)*: Filter by direction (`DEBIT`, `CREDIT`).
  - `search` *(optional, string)*: Case-insensitive search across merchant, RRN, bank name, or account suffix.
  - `account` *(optional, string)*: Filter by exact masked account suffix (e.g., `4821`).

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "amount": 849.00,
    "paymentDate": "2024-10-06T14:30:00",
    "rrn": "312984920194",
    "accountLastFour": "4821",
    "transactionType": "DEBIT",
    "bankBalance": 42150.00,
    "bankName": "HDFC Bank",
    "merchant": "Swiggy",
    "upiId": "swiggy@okhdfcbank",
    "rawSmsId": 101,
    "extractionConfidence": 0.96,
    "parserVersion": "1.0.0-hybrid",
    "validationStatus": "VALID"
  }
]
```

---

### 2.2 Get Transaction Details by ID
* **Endpoint**: `GET /api/transactions/{id}`
* **Response (`200 OK`)**: Single `TransactionResponse` object.
* **Response (`404 Not Found`)**: Returned when ID does not exist in `financial_transactions`.

---

### 2.3 Financial Liquidity Summary
* **Endpoint**: `GET /api/transactions/summary`
* **Query Parameters**: `account` *(optional)*

#### Response (`200 OK`)
```json
{
  "totalSpent": 8368.00,
  "totalReceived": 76200.00,
  "netFlow": 67832.00,
  "totalTransactions": 6,
  "totalRawSms": 12
}
```

---

### 2.4 Account Summary Aggregates
* **Endpoint**: `GET /api/transactions/accounts`
* **Description**: Returns all distinct bank account suffixes with their current balance and cash flow aggregates.

#### Response (`200 OK`)
```json
[
  {
    "accountLastFour": "4821",
    "bankName": "HDFC Bank",
    "latestBalance": 42150.00,
    "totalSpent": 849.00,
    "totalReceived": 75000.00,
    "netFlow": 74151.00,
    "transactionCount": 2,
    "lastTransactionDate": "2024-10-06T14:30:00"
  }
]
```

---

### 2.5 Reprocess Pending Raw Messages
* **Endpoint**: `POST /api/transactions/reparse-all`
* **Description**: Re-evaluates all raw messages flagged as `PENDING` through the Python ML parser.

#### Response (`200 OK`)
```json
{
  "success": true,
  "reprocessedCount": 3,
  "message": "Pending raw SMS messages processed"
}
```

---

## 3. Analytics API (`smssyncserverBACKEND`)

### 3.1 Spending Trends
* **Endpoint**: `GET /api/analytics/spending`
* **Query Parameters**: `account` *(optional)*

#### Response (`200 OK`)
```json
[
  { "date": "Oct 01", "debit": 1250.00, "credit": 0.00 },
  { "date": "Oct 06", "debit": 849.00, "credit": 75000.00 }
]
```

---

### 3.2 Top Merchants Leaderboard
* **Endpoint**: `GET /api/analytics/merchants`
* **Query Parameters**: `account` *(optional)*

#### Response (`200 OK`)
```json
[
  { "merchant": "Swiggy", "count": 2, "totalAmount": 1120.00 },
  { "merchant": "Amazon India", "count": 1, "totalAmount": 1499.00 }
]
```

---

### 3.3 Bank Volume Distribution
* **Endpoint**: `GET /api/analytics/banks`
* **Query Parameters**: `account` *(optional)*

#### Response (`200 OK`)
```json
[
  { "bankName": "HDFC Bank", "count": 3, "totalAmount": 77049.00 },
  { "bankName": "State Bank of India", "count": 2, "totalAmount": 1819.00 }
]
```

---

## 4. Internal AI/ML Service API (`ai-ml`)

### 4.1 Service Health Check
* **Endpoint**: `GET /health`

#### Response (`200 OK`)
```json
{
  "status": "UP",
  "service": "sms2finance-ml",
  "version": "1.0.0-hybrid",
  "description": "Hybrid information extraction combining machine-learning NER model with deterministic regex/rules"
}
```

---

### 4.2 Parse Single SMS (Algorithm 2)
* **Endpoint**: `POST /internal/parser/parse`
* **Caller**: Spring Boot `PythonParserClient`

#### Request Payload
```json
{
  "sms_id": 101,
  "sender": "HDFCBK",
  "message": "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00.",
  "timestamp": 1728212400000
}
```

#### Response Payload (`200 OK`)
```json
{
  "sms_id": 101,
  "sender": "HDFCBK",
  "amount": 849.00,
  "payment_date": "2024-10-06T14:30:00",
  "rrn": "312984920194",
  "account_last_four": "4821",
  "transaction_type": "DEBIT",
  "bank_balance": 42150.00,
  "bank_name": "HDFC Bank",
  "merchant": "Swiggy",
  "upi_id": null,
  "extraction_confidence": 0.96,
  "parser_version": "1.0.0-hybrid",
  "validation_status": "VALID",
  "entities": [
    {
      "entity_type": "AMOUNT",
      "value": "849.00",
      "source": "REGEX",
      "confidence": 0.98,
      "start_idx": 0,
      "end_idx": 10
    },
    {
      "entity_type": "MERCHANT",
      "value": "Swiggy",
      "source": "NER",
      "confidence": 0.92,
      "start_idx": 36,
      "end_idx": 42
    },
    {
      "entity_type": "RRN",
      "value": "312984920194",
      "source": "REGEX",
      "confidence": 0.99,
      "start_idx": 64,
      "end_idx": 76
    }
  ]
}
```

---

### 4.3 Deduplication Evaluation (Algorithm 3)
* **Endpoint**: `POST /internal/parser/deduplicate`

#### Request Payload
```json
{
  "new_transaction": {
    "amount": 849.00,
    "rrn": "312984920194",
    "account_last_four": "4821",
    "transaction_type": "DEBIT",
    "merchant": "Swiggy",
    "timestamp": 1728212405000
  },
  "existing_transactions": [
    {
      "id": 1,
      "amount": 849.00,
      "rrn": "312984920194",
      "account_last_four": "4821",
      "transaction_type": "DEBIT",
      "merchant": "Swiggy",
      "timestamp": 1728212400000
    }
  ]
}
```

#### Response Payload (`200 OK`)
```json
{
  "decision": "DUPLICATE_DROP",
  "reason": "Level 1 exact RRN match",
  "matched_id": 1,
  "similarity_score": 1.0
}
```
