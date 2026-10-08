# FinSight AI (SMS2Finance) — Module Directory & Responsibilities

> **Document Scope**: Exhaustive code-level map of all modules, classes, controllers, and services across the active repository.  
> **Source Root**: [`SMS2Finance/`](file:///c:/Users/HP/Downloads/SMS2Finance)

---

## 1. High-Level Directory Overview

```text
SMS2Finance/
├── doc/                        # Comprehensive project and academic documentation
├── sms-android/                # Android edge client (Java / Android SDK 34)
├── smssyncserverBACKEND/       # Ingestion and core API server (Java 21 / Spring Boot 4)
├── ai-ml/                      # Information extraction & ML service (Python / FastAPI)
├── frontend/                   # Financial analytics dashboard (React 18 / TypeScript / Vite)
└── README.md                   # Master project README & user guide
```

---

## 2. Android Edge Subsystem (`sms-android/`)

Located at: [`sms-android/app/src/main/java/com/vedansh/smssync/`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/main/java/com/vedansh/smssync)

```text
sms-android/app/src/main/java/com/vedansh/smssync/
├── activity/
│   └── MainActivity.java          # Activity lifecycle, UI sync trigger button, logging console
├── filter/
│   └── BankSmsFilter.java         # Algorithm 1: Edge-Device Level-1 Bank Transaction Filter
├── model/
│   ├── SmsModel.java              # Client-side DTO for outgoing SMS payload (sender, message, timestamp)
│   └── SmsResponse.java           # Network response model received from Spring Boot
├── network/
│   ├── ApiService.java            # Retrofit interface defining POST /api/sms endpoint
│   └── RetrofitClient.java        # Retrofit singleton with OkHttp logging and base URL configuration
├── service/
│   ├── SmsReaderService.java      # Queries Telephony inbox, applies 30-day & lastSync filters, sorts oldest-first
│   └── SmsUploadService.java      # Sequential upload queue with success-only checkpoint advancement
├── storage/
│   └── SyncPreference.java        # Thread-safe SharedPreferences manager for `lastSync` checkpoint
└── util/
    ├── DateUtil.java              # Temporal boundary validation (30-day sliding window)
    └── PermissionUtil.java        # Android runtime permission checker for READ_SMS
```

### Module Responsibilities
* **`BankSmsFilter.java`**: Implements Algorithm 1. Evaluates incoming messages against `BANK_SENDERS`, drops promotional terms (`PROMOTIONAL_TRIGGERS`) and isolated authentication codes, checks intent keywords (`TRANSACTION_KEYWORDS`), and matches currency regular expressions.
* **`SmsReaderService.java`**: Reads local SMS inbox, filters out messages older than 30 days and previously synced messages, and reverses the ContentResolver's descending order so that transmissions occur in chronological ascending order.
* **`SmsUploadService.java`**: Recursively uploads messages one by one using Retrofit asynchronous calls. Advances `lastSync` only upon receiving HTTP 200 responses.

---

## 3. Spring Boot Backend Subsystem (`smssyncserverBACKEND/`)

Located at: [`smssyncserverBACKEND/src/main/java/com/vedansh/smssyncserver/`](file:///c:/Users/HP/Downloads/SMS2Finance/smssyncserverBACKEND/src/main/java/com/vedansh/smssyncserver)

```text
smssyncserverBACKEND/src/main/java/com/vedansh/smssyncserver/
├── config/
│   └── SecurityConfig.java        # CORS filter registration and permit-all development access rules
├── controller/
│   ├── SmsController.java         # POST /api/sms (ingestion), GET /api/sms (raw feed)
│   ├── TransactionController.java # GET /api/transactions, GET /api/transactions/{id}, GET /api/transactions/summary, GET /api/transactions/accounts, POST /api/transactions/reparse-all
│   └── AnalyticsController.java   # GET /api/analytics/spending, /merchants, /banks
├── dto/
│   ├── SmsRequest.java            # Inbound DTO from Android (sender, message, timestamp)
│   ├── SmsResponse.java           # Outbound acknowledgement (success, message)
│   ├── TransactionResponse.java   # Structured transaction view with provenance and confidence
│   ├── AccountSummaryResponse.java# Per-account liquidity and transaction aggregates
│   ├── FinancialSummaryResponse.java # Global totals (totalSpent, totalReceived, netFlow)
│   ├── PythonParseRequest.java    # Internal DTO passed to Python FastAPI ML service
│   └── PythonParseResponse.java   # Structured extraction returned by Python ML service
├── entity/
│   ├── SmsEntity.java             # JPA entity for table `sms_messages`
│   └── TransactionEntity.java     # JPA entity for table `financial_transactions`
├── mapper/
│   └── SmsMapper.java             # DTO to Entity transformation helpers
├── repository/
│   ├── SmsRepository.java         # Spring Data JPA interface for raw SMS records
│   └── TransactionRepository.java # JPA interface with custom criteria and aggregation queries
└── service/
    ├── SmsService.java            # Manages raw SMS persistence and triggers ML parsing
    ├── TransactionService.java    # Business logic for transaction filtering, summaries, and analytics
    └── PythonParserClient.java    # Spring RestClient implementation calling Python FastAPI at :8000
```

---

## 4. AI/ML Information Extraction Subsystem (`ai-ml/`)

Located at: [`ai-ml/`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml)

```text
ai-ml/
├── app/
│   ├── main.py                    # FastAPI application, CORS middleware, routes (/health, /parse, /deduplicate)
│   └── models.py                  # Pydantic data models for requests, responses, and entity provenance
├── rules/
│   ├── regex_catalog.py           # Catalogs of compiled regexes (Amount, RRN, Account, UPI, Balances, Headers)
│   └── rule_extractor.py          # Deterministic extraction engine implementing rule evaluation
├── nlp/
│   └── ner_engine.py              # Contextual token-classification engine for merchants and transaction intent
├── normalization/
│   └── reconciliation.py          # Algorithm 2: Conflict-Aware Entity Reconciliation
├── deduplication/
│   └── tiered_dedup.py            # Algorithm 3: Tiered Financial Transaction Deduplication
├── benchmark/
│   ├── dataset_generator.py       # Generator for 2,500 differentially anonymized benchmark messages
│   └── ablation_runner.py         # Evaluates 5-stage ablation matrix (Ablation-A to Ablation-E)
├── data/
│   └── benchmark_2500.json         # Persisted 2,500 message benchmark evaluation corpus
├── tests/
│   └── test_parser.py             # Pytest suite verifying rules, NER, reconciliation, dedup, and edge filter
└── requirements.txt               # Python package dependencies
```

---

## 5. React Analytics Dashboard Subsystem (`frontend/`)

Located at: [`frontend/src/`](file:///c:/Users/HP/Downloads/SMS2Finance/frontend/src)

```text
frontend/src/
├── App.tsx                        # Master layout, state orchestration, account switching, view toggling
├── index.css                      # Tailwind styling, custom scrollbars, and dark glassmorphic effects
├── main.tsx                       # React DOM root bootstrapping
├── components/
│   ├── Navbar.tsx                 # Top navigation header, branding, connection status indicators
│   ├── KpiCards.tsx               # Total Outflow, Total Inflow, Net Balance, and Transaction Count cards
│   ├── AccountSelector.tsx        # Multi-account selector dropdown with balance and activity metrics
│   ├── AnalyticsCharts.tsx        # AreaChart (cash flow), PieChart (bank shares), BarChart (merchants)
│   ├── TransactionTable.tsx       # Live search, filters (Type, Bank), pagination, and inspection triggers
│   ├── TransactionModal.tsx       # Extraction provenance modal with confidence meters and source badges
│   ├── SmsIngestionFeed.tsx       # Real-time raw SMS ingestion feed and re-parsing trigger button
│   └── ResearchBenchmarkModal.tsx # Interactive modal displaying empirical Ablation A to E findings
├── services/
│   └── api.ts                     # REST client connecting to Spring Boot API with fallback mock data
└── types/
    └── index.ts                   # TypeScript interfaces matching backend DTO schemas
```
