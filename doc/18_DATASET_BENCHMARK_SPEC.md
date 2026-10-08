# FinSight AI (SMS2Finance) — Dataset & Benchmark Specification

> **Document Scope**: Academic benchmark corpus specification, class distributions, differential anonymization protocols, and token annotation schemas.  
> **Benchmark Dataset File**: [`ai-ml/data/benchmark_2500.json`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/data/benchmark_2500.json)  
> **Generation Script**: [`ai-ml/benchmark/dataset_generator.py`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/benchmark/dataset_generator.py)

---

## 1. Corpus Distribution & Stratification

The FinSight AI benchmark comprises **2,500 curated and labeled messages**, stratified across major payment modalities and non-financial distractors:

| Transaction Category | Split % | Target Count | Description |
|---|---|---|---|
| **Debit: UPI Payments** | 35% | 875 | Peer-to-peer (P2P) and peer-to-merchant (P2M) mobile debits with VPAs and RRNs |
| **Debit: Card / ATM / IMPS** | 15% | 375 | POS merchant card swipes, ATM cash withdrawals, and IMPS/NEFT debits |
| **Credit: Inward / Salary / Refunds** | 20% | 500 | Inward credits, corporate payroll direct deposits, and merchant refunds |
| **Transactional Distractors (OTPs)** | 15% | 375 | Authentication OTPs and login verification codes (**critical negative class**) |
| **Informational & Promotional Spam** | 15% | 375 | Pre-approved loan offers, credit card marketing, and limit enhancements |
| **Total Benchmark Corpus** | **100%** | **2,500** | Stratified across 6 major Indian banking institutions |

---

## 2. Institutional Banking Coverage

The dataset incorporates real-world notification templates from six major Indian commercial and public sector banks:

1. **State Bank of India (SBI)** — Alphanumeric Headers: `SBIINB`, `SBISMS`, `SBIPAY`, `ATMSBI`
2. **HDFC Bank** — Alphanumeric Headers: `HDFCBK`, `HDFCCC`, `HDFCLO`
3. **ICICI Bank** — Alphanumeric Headers: `ICICIB`, `ICICIT`, `ICICIP`
4. **Axis Bank** — Alphanumeric Headers: `AXISBK`, `AXISBC`
5. **Punjab National Bank (PNB)** — Alphanumeric Headers: `PNBSMS`, `PNBBNK`
6. **Bank of Baroda (BOB)** — Alphanumeric Headers: `BOBTXN`, `BARODA`

---

## 3. Strict Differential Anonymization Protocol

To comply with data privacy regulations (GDPR, India's DPDP Act 2023) and academic ethics standards, all entries are differentially sanitized:

1. **Account Number Masking**: Retains only the final 4 digits; preceding digits are substituted with `XX` or `**` (e.g., `A/c **4821`).
2. **Mobile Number Normalization**: Real telephone numbers are replaced with the fixed synthetic standard `+91-9876543210`.
3. **Personal Identity & VPA Replacement**: Individual recipient names and personal UPI handles are substituted with randomized synthetic tags (`user123@upi`), while retaining verified commercial merchant names (`Swiggy`, `Amazon`, `Zomato`).
4. **Card Number Masking**: Full Primary Account Numbers (PAN) are replaced with `Card ending in 4321`.
5. **RRN / UTR Substitution**: Preserves standard 12-digit numeric length while substituting digit sequences to prevent correlation with live banking ledgers.

---

## 4. Token-Level Annotation Schema (IOB2 / CoNLL)

For token classification NER evaluation, sentences are annotated in standard **IOB2** formatting:

```text
Message: "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00."

Token         Tag
-------------------------
Rs.           B-AMOUNT
849.00        I-AMOUNT
debited       B-TXN_TYPE
from          O
A/c           O
**4821        B-ACC_NUM
to            O
Swiggy        B-MERCHANT
on            O
06-Oct-24     O
.             O
UPI           O
Ref           O
312984920194  B-RRN
.             O
Avl           O
Bal:          O
Rs.           B-BALANCE
42,150.00     I-BALANCE
```

### Supported Entity Tag Taxonomy
* `B-AMOUNT`, `I-AMOUNT`: Transaction monetary currency and figure.
* `B-MERCHANT`, `I-MERCHANT`: Payee or commercial beneficiary name.
* `B-RRN`: 12-digit Retrieval Reference Number / UTR / Transaction ID.
* `B-ACC_NUM`: Masked source or destination bank account suffix.
* `B-TXN_TYPE`: Explicit directional indicator (`debited`, `credited`).
* `B-BALANCE`, `I-BALANCE`: Remaining ledger or available account balance.
* `B-UPI_ID`: Virtual Payment Address (VPA).

---

## 5. Benchmark JSON Schema

Each evaluation entry in [`ai-ml/data/benchmark_2500.json`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/data/benchmark_2500.json) adheres to the following structure:

```json
{
  "id": 1,
  "sender": "HDFCBK",
  "message": "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00.",
  "timestamp": 1728212400000,
  "is_financial_transaction": true,
  "category": "DEBIT_UPI",
  "bank": "HDFC Bank",
  "ground_truth": {
    "amount": 849.00,
    "transaction_type": "DEBIT",
    "account_last_four": "4821",
    "merchant": "Swiggy",
    "rrn": "312984920194",
    "bank_balance": 42150.00,
    "bank_name": "HDFC Bank"
  }
}
```
