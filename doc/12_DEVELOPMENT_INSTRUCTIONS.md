# FinSight AI (SMS2Finance) — Development Instructions & Guidelines

> **Mandatory Guidelines for Developers, Contributors, and Automated AI Agents**  
> **Repository**: [FinSight-AI (SMS2Finance)](file:///c:/Users/HP/Downloads/SMS2Finance)

---

## 1. Golden Rules of Development

1. **Inspect Before Modifying**: Always inspect the active repository before introducing changes. Never assume a file structure or dependency without checking existing files.
2. **Preserve Language & Subsystem Boundaries**:
   - **Android Client**: Java only. Do not convert to Kotlin unless mandated by an explicit architectural decision.
   - **Backend API**: Java 21 + Spring Boot only. Do not introduce Python into core ingestion.
   - **ML & Extraction**: Python 3.10+ (FastAPI) only.
   - **Frontend UI**: React + TypeScript only. Never connect frontend directly to PostgreSQL.
3. **Classify Feature Implementation Accurately**:
   - Classify every capability as `IMPLEMENTED`, `PARTIAL`, or `PLANNED`. Never declare planned roadmap features as implemented without actual code, tests, and execution artifacts.
4. **Never Rename Active API Contract Fields Silently**:
   - The Android client transmits `{ "sender": "...", "message": "...", "timestamp": ... }`. Renaming `message` to `body` or `smsBody` without backward compatibility breaks edge synchronization.
5. **Protect Checkpoint Integrity**:
   - `lastSync` in Android `SharedPreferences` is a synchronization checkpoint, not a transaction identifier. It must advance **only after the server returns an HTTP 200 OK**.
6. **Protect Deduplication Integrity**:
   - Never deduplicate by transaction amount alone. Legitimate consumers routinely perform identical-amount transactions. Use Algorithm 3 (RRN exact match or temporal composite fuzzy match).
7. **Research & Metric Integrity**:
   - Never fabricate benchmark results, F1 scores, latency figures, or dataset statistics.

---

## 2. Step-by-Step Guide: Adding Support for a New Bank

When extending the system to support a new financial institution (e.g., `IndusInd Bank` or `Yes Bank`):

### Step 1: Update Android Edge Filter (`sms-android`)
In [`sms-android/app/src/main/java/com/vedansh/smssync/filter/BankSmsFilter.java`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/main/java/com/vedansh/smssync/filter/BankSmsFilter.java):
* Add the new bank's telephony alphanumeric header prefixes to `BANK_SENDERS` (e.g., `"INDUS"`, `"INDUSB"`, `"YESBK"`).
* If the bank uses novel transaction keywords, update `TRANSACTION_KEYWORDS`.

### Step 2: Update Python Regex Catalog (`ai-ml`)
In [`ai-ml/rules/regex_catalog.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/rules/regex_catalog.py):
* Add the bank identifier to `BANK_HEADER_MAP` with its canonical display title (e.g., `"YESBK": "Yes Bank"`).
* If the bank uses unique phrasing for balances or reference numbers, add targeted regex patterns to `PATTERN_BANK_SPECIFIC`.

### Step 3: Add Synthetic Unit Tests (`ai-ml/tests/`)
In [`ai-ml/tests/test_parser.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/tests/test_parser.py):
* Add a test method simulating the bank's typical debit and credit notification messages.
* Assert that `AMOUNT`, `RRN`, `ACC_NUM`, `BANK_NAME`, and `TXN_TYPE` are correctly reconciled.

### Step 4: Run Verification Suites
Execute the test suites across tiers:
```bash
# Verify Python ML parser
cd ai-ml && python -m pytest tests/

# Verify Spring Boot backend
cd ../smssyncserverBACKEND && mvn test-compile

# Verify Android edge filter
cd ../sms-android && gradlew.bat test
```

---

## 3. Git Commit & Code Quality Standards

* **Commit Messages**: Follow conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
* **Sanitized Commits**: Never include real personal SMS, active phone numbers, or passwords in Git commits.
* **Documentation Currency**: When altering an API endpoint or entity schema, update the corresponding documentation file in [`doc/`](file:///c:/Users/HP/Downloads/SMS2Finance/doc) immediately.
