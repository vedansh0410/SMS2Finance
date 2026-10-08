import re
from typing import Dict, List, Pattern

# Common Indian bank header sender prefixes / substrings
BANK_HEADER_MAP: Dict[str, str] = {
    "HDFC": "HDFC Bank",
    "SBI": "State Bank of India",
    "ICICI": "ICICI Bank",
    "AXIS": "Axis Bank",
    "PNB": "Punjab National Bank",
    "BOB": "Bank of Baroda",
    "BARODA": "Bank of Baroda",
    "KOTAK": "Kotak Mahindra Bank",
    "IDFC": "IDFC FIRST Bank",
    "CANBNK": "Canara Bank",
    "CANARA": "Canara Bank",
    "UNION": "Union Bank of India",
    "UBI": "Union Bank of India",
    "YESBNK": "Yes Bank",
    "YESBK": "Yes Bank",
    "INDUS": "IndusInd Bank",
    "BOI": "Bank of India",
    "CENTBK": "Central Bank of India",
    "CBI": "Central Bank of India",
    "IOB": "Indian Overseas Bank",
    "PSB": "Punjab & Sind Bank",
    "UCO": "UCO Bank",
    "FED": "Federal Bank",
    "FEDERAL": "Federal Bank",
    "SIB": "South Indian Bank",
    "RBL": "RBL Bank",
    "SCB": "Standard Chartered Bank",
    "HSBC": "HSBC Bank",
    "CITI": "Citibank",
    "DBS": "DBS Bank",
    "AU": "AU Small Finance Bank",
    "AUBANK": "AU Small Finance Bank",
    "INDBNK": "Indian Bank",
    "INDIAN": "Indian Bank",
    "INDIANBNK": "Indian Bank",
    "PAYTM": "Paytm Payments Bank",
    "AIRTEL": "Airtel Payments Bank",
    "IPPB": "India Post Payments Bank",
    "JIO": "Jio Payments Bank",
    "CRED": "CRED",
    "ONECRD": "OneCard",
    "UPI": "UPI",
}

# Currency amount regex patterns
# Matches: Rs. 500, Rs 1,500.50, INR 250, ₹450, ₹ 1,200, Rs.500/-, 500.00 INR, 14200.00
AMOUNT_PATTERNS: List[Pattern] = [
    re.compile(r'(?:(?:Rs\.?|INR|[₹\u20B9\u20A8])\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?))', re.IGNORECASE),
    re.compile(r'([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:INR|Rs\.?|[₹\u20B9\u20A8])', re.IGNORECASE),
    re.compile(r'(?:debited|credited|withdrawn|spent|transferred|paid|dr|cr|txn)\s+(?:by|with|for|of)?\s*(?:Rs\.?|INR|[₹\u20B9\u20A8])?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)', re.IGNORECASE),
]

# RRN / Reference number patterns (e.g. UPI Ref 312345678901, RRN: 123456789, UTR 9876543210)
RRN_PATTERNS: List[Pattern] = [
    re.compile(r'(?:UPI\s*Ref(?:\s*no)?\.?|RRN|Ref\s*no\.?|Ref\s*#|UTR(?:\s*no)?\.?|Txn\s*ID)[:\s#]*([0-9A-Za-z]{6,16})', re.IGNORECASE),
    re.compile(r'(?:reference\s*number)[:\s]*([0-9A-Za-z]{6,16})', re.IGNORECASE),
]

# Account last 4 digits patterns (e.g. A/c XX1234, Account ...5678, Card ending in 4321)
ACCOUNT_PATTERNS: List[Pattern] = [
    re.compile(r'(?:a/c|acct|acc|account|card)\s*(?:no\.?|num)?\s*(?:ending\s*)?(?:with\s*)?[:\s]*(?:[xX*]+|ending\s+in\s+)?([0-9]{4})\b', re.IGNORECASE),
    re.compile(r'\b[xX*]{2,}([0-9]{4})\b'),
]

# Transaction Type patterns
DEBIT_PATTERN: Pattern = re.compile(
    r'\b(debited|debit|withdrawn|spent|paid|transferred|transfer|purchase|charge|sent|dr|deducted|auto-debit)\b',
    re.IGNORECASE
)
CREDIT_PATTERN: Pattern = re.compile(
    r'\b(credited|credit|deposited|received|refund|inward|cr)\b',
    re.IGNORECASE
)

# UPI ID pattern (e.g. user@okhdfcbank, merchant.pay@upi)
UPI_ID_PATTERN: Pattern = re.compile(r'\b([a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,32})\b')

# Bank Balance patterns (e.g. Bal: Rs 15,200.50, Avl Bal INR 4,320.00, Avl Bal ₹500, Available balance 500)
BALANCE_PATTERNS: List[Pattern] = [
    re.compile(r'(?:avl\s*bal|available\s*bal(?:ance)?|bal(?:ance)?|ac\s*bal)(?:\s*(?:is|:|\.))?\s*(?:Rs\.?|INR|[₹\u20B9\u20A8])?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)', re.IGNORECASE),
]

# Merchant capture via standard phrasing (e.g. to SWIGGY, at AMAZON, credited by NAME)
MERCHANT_RULE_PATTERNS: List[Pattern] = [
    re.compile(r'(?:to|at|towards|for)\s+([A-Za-z0-9\s&.\'-]{2,35}?)(?:\s+(?:on|ref|rrn|via|upi|avl|bal|using|through|\.|$))', re.IGNORECASE),
    re.compile(r'(?:credited(?:\s+with[^\.]*?)?\s+by)\s+([A-Za-z0-9\s&.\'-]{2,35}?)(?:\s+(?:on|ref|rrn|avl|bal|\.|$))', re.IGNORECASE),
    re.compile(r'(?:vpa|merchant)\s*[:\-]\s*([A-Za-z0-9\s&.\'-]{2,35}?)(?:\s+(?:on|ref|rrn|via|\.|$))', re.IGNORECASE),
]
