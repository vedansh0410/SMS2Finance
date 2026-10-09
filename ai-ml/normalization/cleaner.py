import re
from typing import Optional


def clean_merchant_name(raw: Optional[str]) -> Optional[str]:
    """
    Sanitizes extracted merchant/payee strings by stripping off trailing
    transaction reference metadata (RRN, UTR, Ref, UPI Ref, Avl/Bal, SMS block warnings, etc.)
    and normalizing formatting.
    """
    if not raw:
        return None
    cleaned = str(raw).strip()

    # Normalize multiple whitespace characters
    cleaned = re.sub(r'\s+', ' ', cleaned)

    # Patterns to strip trailing reference/RRN/UTR/Balance metadata
    strip_patterns = [
        # Match trailing .Rrn 1234.Avl, RRN: 1234, .Ref 1234, UTR 1234, etc.
        r'[\.\s]+(?:rrn|utr|ref|reference|upi\s*ref|crn|urn)[\s\:\.\#\-]*(?:[0-9a-zA-Z]+)?(?:[\.\s]+(?:avl|bal|avail|available).*)?$',
        # Match trailing Avl Bal, Available Balance, Bal Rs...
        r'[\.\s]+(?:avl|bal|avail|available|balance|ac\s*bal|a\/c\s*bal)[\s\:\.\#\-].*$',
        # Trailing standalone .Avl or .Bal
        r'[\.\s]+(?:avl|bal)$',
        # Trailing fraud/security notices: Not you?, SMS BLOCK, etc.
        r'[\.\s]+(?:not\s*you|sms\s*block|to\s*block|block).*$',
        # Trailing channel/prep: via UPI, using ..., through ..., from a/c ...
        r'[\.\s]+(?:via|using|through|from\s+a\/c|from\s+ac|on\s+\d{2}[-/.]\d{2}[-/.]\d{2,4}).*$',
        # Trailing standalone reference numbers (6 or more digits attached at the end)
        r'[\.\s]+\d{6,}$'
    ]

    for p in strip_patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE).strip()

    # Clean off trailing punctuation (. , - / : ; #)
    cleaned = cleaned.rstrip('.-/:,;# ')

    # Filter out common noise phrases or overly short fragments
    if len(cleaned) < 2 or cleaned.lower() in {
        'your', 'vpa', 'account', 'a/c', 'card', 'bank', 'otp', 'code',
        'rs', 'inr', 'an', 'the', 'to', 'for', 'at', 'by', 'avl', 'bal'
    }:
        return None

    # Title-case if all-caps or all-lowercase
    if cleaned.isupper() or cleaned.islower():
        cleaned = cleaned.title()

    return cleaned
