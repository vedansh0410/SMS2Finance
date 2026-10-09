/**
 * Utility to clean and format merchant/payee names by stripping off
 * trailing transaction reference noise (e.g. .Rrn 123456.Avl, UTR, Ref).
 */
export function cleanMerchantName(raw?: string | null, fallback = 'Financial Transaction'): string {
  if (!raw || !raw.trim()) return fallback;
  let cleaned = raw.trim();

  // Strip trailing patterns like .Rrn 123456.Avl, RRN: 1234, .Ref, .UTR, .Avl, .Bal
  cleaned = cleaned.replace(/[\.\s]+(?:rrn|utr|ref|reference|upi\s*ref|crn|urn)[\s\:\.\#\-]*(?:[0-9a-zA-Z]+)?(?:[\.\s]+(?:avl|bal|avail|available).*)?$/i, '');
  cleaned = cleaned.replace(/[\.\s]+(?:avl|bal|avail|available|balance)[\s\:\.\#\-].*$/i, '');
  cleaned = cleaned.replace(/[\.\s]+(?:avl|bal)$/i, '');
  cleaned = cleaned.replace(/[\.\s]+(?:not\s*you|sms\s*block|to\s*block|block).*$/i, '');
  cleaned = cleaned.replace(/[\.\s]+\d{6,}$/i, '');
  cleaned = cleaned.replace(/[\.\-\/:,;#\s]+$/, '').trim();

  return cleaned.length > 0 ? cleaned : fallback;
}
