# FinSight AI (SMS2Finance) — Limitations & Future Roadmap

> **Document Scope**: Critical analysis of current technical limitations, edge cases, and strategic future engineering roadmap.

---

## 1. Current System Limitations

While FinSight AI achieves high empirical extraction fidelity (**0.9400 Macro F1** and **32.91% edge bandwidth savings**), several technical boundaries remain:

### 1.1 Multilingual & Transliterated Banking SMS
* **Constraint**: The current regex catalog and NER token classifier are optimized for English-language notifications.
* **Impact**: Bank notifications formatted in regional Indian languages (e.g., Hindi, Tamil, Telugu, Marathi) or Romanized transliterations ("Aapke khate se Rs. 500 kate gaye") fail keyword trigger checks in Algorithm 1 and fall back to raw message storage.

### 1.2 Multi-Part (Concatenated) SMS Splitting
* **Constraint**: Cellular networks sometimes split long notification messages exceeding the standard 160 GSM-7 character boundary into distinct SMS segments.
* **Impact**: If a financial notification is split across two telephony rows, the currency amount may arrive in the first message while the RRN and merchant appear in the second, causing partial extractions.

### 1.3 Regional & Cooperative Bank Variations
* **Constraint**: Small cooperative or rural banks frequently deviate from standard Reserve Bank of India (RBI) notification templates.
* **Impact**: Inconsistent header prefixes (e.g., non-standard SMS sender IDs) may cause Algorithm 1 to drop legitimate messages unless manually whitelisted.

### 1.4 Android Background Restrictions & Battery Optimization
* **Constraint**: Modern Android versions (API 31+) enforce aggressive battery optimization (Doze Mode) and restrictions on background telemetry access.
* **Impact**: Automatic background synchronization requires explicit foreground service declarations or work manager scheduling to prevent premature process termination by OEM task managers.

### 1.5 Currency Scope
* **Constraint**: The current pipeline is tailored for the Indian Rupee (`INR`, `Rs.`, `₹`). Multi-currency transactions (e.g., international credit card charges in `USD`, `EUR`, `GBP`) are not currently normalized to a base currency.

---

## 2. Strategic Engineering Roadmap

```text
Phase 1: Current Release (v1.0-Hybrid)
├── Algorithm 1 Edge Filter (Java / Android)
├── Spring Boot Ingestion & Relational Ledger (PostgreSQL)
├── FastAPI Hybrid NER + Regex Catalog (Macro F1 = 0.9400)
└── React 18 / TypeScript Analytics Dashboard
               │
               ▼
Phase 2: Edge-Native Intelligence (v1.5)
├── Quantized On-Device NER (ONNX Runtime Mobile / TFLite in Android)
├── Automatic Multi-Part SMS Assembly (Concatenation Resolver)
└── Expanded Regional Bank Header Catalog (100+ Indian Institutions)
               │
               ▼
Phase 3: Financial Intelligence & Autonomy (v2.0)
├── Hierarchical Category Classification (Groceries, Utilities, Dining, Investments)
├── Recurring Subscription & SIP Detection
├── Predictive End-of-Month Cash-Flow Forecasting
└── RBI Account Aggregator (AA) Dual-Channel Verification
```

---

## 3. High-Priority Research Extensions

1. **On-Device Zero-Knowledge Extraction**:
   - Compressing the token classification model to $< 15\text{MB}$ via INT8 quantization to execute complete extraction on the Android device, eliminating cloud transmission of financial text entirely.
2. **Federated & Differential Learning**:
   - Enabling devices to collaboratively train extraction models on novel bank templates using federated averaging without aggregating private SMS text on central servers.
3. **User-in-the-Loop Active Learning**:
   - Allowing users to correct misclassified merchants directly from the React dashboard, feeding anonymized corrections into an active retraining pipeline.
