# FinSight AI (SMS2Finance) — Read First

> **Mandatory Orientation for Contributors, Researchers, and AI Agents**
> **Repository**: [FinSight-AI (SMS2Finance)](file:///c:/Users/HP/Downloads/SMS2Finance)
> **Documentation Root**: [`doc/`](file:///c:/Users/HP/Downloads/SMS2Finance/doc)

---

## 1. Executive Purpose

This document establishes the **foundational rules, architectural boundaries, and research integrity constraints** governing the SMS2Finance (FinSight AI) repository. Every contributor, developer, and automated agent must read and adhere to these guidelines prior to proposing or executing code modifications.

---

## 2. Technology Policy & Architectural Boundaries

Strict language and framework boundaries are enforced across the project tiers:

| Layer | Technology | Permitted Roles & Boundaries |
|---|---|---|
| **Edge / Mobile** | **Java (Android SDK 34)** | Telephony inbox reading, Algorithm 1 heuristic filtering, local `lastSync` checkpointing, Retrofit REST streaming. *Kotlin is prohibited unless explicitly decided in a major architectural revision.* |
| **Ingestion & Core API** | **Java 21 + Spring Boot 4** | Ingestion REST endpoint (`POST /api/sms`), relational persistence with Spring Data JPA/Hibernate, Python ML REST client orchestration, transaction querying and analytics endpoints. *No Python in core ingestion.* |
| **Database** | **PostgreSQL 14+** | Storage of raw SMS (`sms_messages`) and extracted financial records (`financial_transactions`). Kept strictly behind Spring Boot; **never exposed directly to frontend or mobile clients**. |
| **Information Extraction & ML** | **Python 3.10+ (FastAPI)** | Deterministic regex catalog, contextual NER token classification, Algorithm 2 entity reconciliation, Algorithm 3 tiered deduplication, ablation benchmarks. |
| **Analytics Dashboard** | **React 18 + Vite + TypeScript** | Responsive web dashboard, KPI metrics, Recharts data visualization, transaction explorer, extraction provenance modal, ingestion monitoring. *Tailwind CSS for styling.* |
| **Networking & Protocols** | **REST over HTTP/HTTPS** | Retrofit on Android, Spring Boot WebMVC, FastAPI JSON REST. |
| **Build & Tooling** | **Maven (Backend), Gradle (Android), npm (Frontend), pip (Python)** | Standardized dependency and build management. |

---

## 3. Critical Terminology & Research Standards

1. **Regex is NOT an AI or Machine Learning Model**:
   - Always refer to the extraction mechanism as a **hybrid information extraction framework combining contextual machine-learning NER token classification with deterministic regex and rule-based extraction**.
   - Regular expressions provide high precision on rigid formats (e.g., currency figures, 12-digit RRNs, masked card/account suffixes), while NER provides generalization on high-variance contextual text (e.g., dynamic merchant names and phrasing variations).

2. **Synchronization Checkpoint vs. Transaction Identity**:
   - `lastSync` is strictly an edge synchronization checkpoint timestamp (epoch milliseconds), **not** a transaction identity.
   - Transaction deduplication relies on **Retrieval Reference Numbers (RRN / UTR)** and temporal composite fuzzy similarity (Algorithm 3), **never on transaction amounts alone**.

3. **No Direct Private App Integration Claims**:
   - Ingestion is strictly driven by **Telephony Bank SMS**.
   - While SMS notifications generated as a result of Google Pay, PhonePe, Paytm, POS swipes, or ATM withdrawals are supported, contributors must **never claim direct integration with Google Pay/Paytm APIs or bank core-banking APIs** unless such integration is physically implemented.

---

## 4. Implementation Status Classification

Before declaring features in documentation or altering code, verify their current state using the three-tier taxonomy:

* **IMPLEMENTED**: Code exists, compiles, is covered by tests, and runs in the active repository.
* **PARTIAL**: Basic structure or mock client exists, but edge cases or end-to-end integration are incomplete.
* **PLANNED**: Documented as future work or design specification, but not yet present in the codebase.

### Current Repository Status Map

```text
Component                  Status         Implementation Details
--------------------------------------------------------------------------------------------------
Android Edge L1 Filter     IMPLEMENTED    BankSmsFilter.java (Algorithm 1)
Android Incremental Sync   IMPLEMENTED    SmsReaderService.java + SyncPreference.java (30-day, oldest-first)
Android Retrofit Client    IMPLEMENTED    SmsUploadService.java + RetrofitClient.java
Spring Boot Ingestion API  IMPLEMENTED    SmsController.java (POST /api/sms)
Spring Boot ML Client      IMPLEMENTED    PythonParserClient.java (REST client to FastAPI)
PostgreSQL Relational DB   IMPLEMENTED    SmsEntity.java, TransactionEntity.java
Spring Boot Query APIs     IMPLEMENTED    TransactionController.java, AnalyticsController.java
Python FastAPI Service     IMPLEMENTED    app/main.py (/health, /parse, /deduplicate)
Python Regex Engine        IMPLEMENTED    rules/regex_catalog.py, rules/rule_extractor.py
Python NER Engine          IMPLEMENTED    nlp/ner_engine.py (contextual token classification)
Algorithm 2 Reconciliation IMPLEMENTED    normalization/reconciliation.py
Algorithm 3 Deduplication  IMPLEMENTED    deduplication/tiered_dedup.py (RRN + Jaro-Winkler)
Benchmark & Ablation Suite IMPLEMENTED    benchmark/dataset_generator.py, benchmark/ablation_runner.py
React Frontend Dashboard   IMPLEMENTED    App.tsx, Recharts analytics, provenance modal, feed
```

---

## 5. Research Integrity & Empirical Grounding

* **Never fabricate metrics**: Accuracy, precision, recall, Macro F1, False Negative Rate (FNR), dataset count, latency, and bank coverage must derive directly from empirical runs (e.g., executing `benchmark/ablation_runner.py` or unit test suites).
* **Differential Anonymization**: Never store, commit, or publish real personal phone numbers, full account numbers, or real banking passwords/OTPs in Git. Use synthetic anonymized datasets matching the specification in [`doc/18_DATASET_BENCHMARK_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/18_DATASET_BENCHMARK_SPEC.md).

---

## 6. Documentation Organization

All project documentation resides in the [`doc/`](file:///c:/Users/HP/Downloads/SMS2Finance/doc) folder:

* [`doc/01_PROJECT_OVERVIEW.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/01_PROJECT_OVERVIEW.md) — Comprehensive problem statement, architecture, and pipeline overview.
* [`doc/02_ARCHITECTURE.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/02_ARCHITECTURE.md) — System architecture, data flows, and layer responsibilities.
* [`doc/03_TECH_STACK.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/03_TECH_STACK.md) — Exhaustive technology stack and dependency catalog.
* [`doc/04_MODULES.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/04_MODULES.md) — Directory organization and module responsibilities.
* [`doc/05_DATA_MODEL.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/05_DATA_MODEL.md) — Database schema, SQL DDL, entity mappings, and indexes.
* [`doc/06_API_CONTRACTS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/06_API_CONTRACTS.md) — REST API specifications and JSON schemas.
* [`doc/07_AI_NLP_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/07_AI_NLP_SPEC.md) — Hybrid extraction engine and NLP design.
* [`doc/08_RESEARCH_EVALUATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/08_RESEARCH_EVALUATION.md) — Research questions, evaluation protocol, and empirical findings.
* [`doc/09_TESTING.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/09_TESTING.md) — Multi-tier test suite guidelines.
* [`doc/10_SECURITY_PRIVACY.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/10_SECURITY_PRIVACY.md) — Security model, edge filtering privacy, and sanitization.
* [`doc/11_FRONTEND_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/11_FRONTEND_SPEC.md) — React dashboard UI/UX architecture.
* [`doc/12_DEVELOPMENT_INSTRUCTIONS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/12_DEVELOPMENT_INSTRUCTIONS.md) — Developer guidelines and contribution rules.
* [`doc/13_SETUP_RUNBOOK.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/13_SETUP_RUNBOOK.md) — Local installation, startup order, and troubleshooting.
* [`doc/14_RESEARCH_PAPER.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/14_RESEARCH_PAPER.md) — Academic paper mapping and publication targets.
* [`doc/15_LIMITATIONS_FUTURE.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/15_LIMITATIONS_FUTURE.md) — Known constraints and engineering roadmap.
* [`doc/16_GLOSSARY.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/16_GLOSSARY.md) — Comprehensive technical and financial domain glossary.
* [`doc/17_FORMAL_ALGORITHMS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/17_FORMAL_ALGORITHMS.md) — Mathematical formulations of Algorithms 1, 2, and 3.
* [`doc/18_DATASET_BENCHMARK_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/18_DATASET_BENCHMARK_SPEC.md) — Benchmark dataset schema and differential anonymization.
* [`doc/19_EXPERIMENTAL_SETUP_ABLATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/19_EXPERIMENTAL_SETUP_ABLATION.md) — Experimental ablation grid (Ablation-A to E).
* [`doc/20_RESEARCH_PAPER_SKELETON.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/20_RESEARCH_PAPER_SKELETON.md) — IEEE conference paper LaTeX manuscript.
