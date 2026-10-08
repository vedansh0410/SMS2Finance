# FinSight AI (SMS2Finance) — Security & Privacy Architecture

> **Document Scope**: Data protection principles, edge-filtering privacy guarantees, differential anonymization protocols, and production hardening guidelines.  
> **Related Protocols**: [`doc/18_DATASET_BENCHMARK_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/18_DATASET_BENCHMARK_SPEC.md)

---

## 1. Edge-Side Filtering as a Privacy Barrier

In conventional Personal Financial Management (PFM) applications, mobile clients frequently upload the user's entire uncurated SMS inbox to cloud servers for server-side classification. This architectural flaw presents serious privacy and compliance hazards:
* Exposes private personal conversations and confidential contacts to third-party servers.
* Transmits transient authentication credentials (One-Time Passwords / OTPs).
* Increases attack surfaces under global privacy regulations (GDPR, India's DPDP Act 2023).

### The FinSight AI Privacy Guarantee
FinSight AI enforces **on-device data minimization**:

```text
User Device Inbox (All SMS)
         │
         ▼
[ Algorithm 1: On-Device Bank Filter ]
         ├── Non-Bank Messages   ──────> [ DROPPED LOCALLY (Never Transmitted) ]
         ├── Authentication OTPs ──────> [ DROPPED LOCALLY (Never Transmitted) ]
         ├── Promotional Spams   ──────> [ DROPPED LOCALLY (Never Transmitted) ]
         │
         ▼
Legitimate Financial Transaction SMS Only
         │ (32.91% Bandwidth Reduction, 0% Private Leaks)
         ▼
[ Encrypted TLS Ingestion to Backend ]
```

---

## 2. Differential Anonymization Protocol

To facilitate rigorous research, benchmarking, and machine learning model training without compromising user privacy, FinSight AI enforces a strict **differential anonymization protocol**:

1. **Account Number Masking**:
   - All account numbers are masked such that only the final 4 digits are accessible:
   - `A/c 123456789012` $\longrightarrow$ `A/c XX9012` or `...9012`.
2. **Phone Number Sanitization**:
   - Real 10-digit mobile phone numbers are detected and replaced with synthetic fixed placeholders:
   - `9876543210` $\longrightarrow$ `+91-9876543210` (Standard Test Identity).
3. **Personal Names & Individual UPI VPAs**:
   - Individual counterparty names and personal UPI handles are randomized:
   - `john.doe@okaxis` $\longrightarrow$ `user123@upi`.
   - Verified commercial merchant names (e.g., `Swiggy`, `Amazon`, `Uber`) are retained to preserve entity recognition training utility.
4. **Card Primary Account Numbers (PAN)**:
   - Full 16-digit or 12-digit card numbers are never retained:
   - Replaced with standard descriptor: `Card ending in 4321`.
5. **Retrieval Reference Numbers (RRN / UTR)**:
   - Digit sequences are systematically permuted while preserving character length and syntax to prevent correlation with live banking ledgers.

---

## 3. Engineering Security Policies

All developers and contributors must adhere to the following rules:

* **Zero Real SMS in Git**: Under no circumstances should real personal bank SMS messages be committed to source code or documentation. Use the anonymized benchmark generator ([`ai-ml/benchmark/dataset_generator.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/benchmark/dataset_generator.py)).
* **No Hardcoded Credentials**: Database passwords, JWT secrets, and API keys must be injected via environment variables or external configuration profiles.
* **Log Sanitization**: Application loggers (`log.info`, `Log.d`) must never output full raw SMS bodies containing account balances in production configurations.
* **Database Isolation**: The PostgreSQL instance is accessible exclusively by Spring Boot via private network channels; no direct public internet exposure.

---

## 4. Production Deployment Hardening Checklist

When transitioning from the development prototype to production deployment:

- [ ] **Transport Layer Security (TLS 1.3)**: Enforce HTTPS across all Android-to-Backend and Frontend-to-Backend communications.
- [ ] **Authentication & Access Control**: Implement OAuth 2.0 / JWT bearer token verification on all `/api/*` endpoints.
- [ ] **Database Encryption**: Enable PostgreSQL Transparent Data Encryption (TDE) or disk-level LUKS encryption for stored transaction tables.
- [ ] **Rate Limiting**: Deploy an API gateway (e.g., NGINX / Spring Cloud Gateway) enforcing rate limits per device ID to prevent denial-of-service abuse.
- [ ] **Audit Logging**: Enable immutable database audit logs for all update and delete queries on `financial_transactions`.
