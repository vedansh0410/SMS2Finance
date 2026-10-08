from typing import List, Dict, Any, Optional, Tuple


def jaro_distance(s1: str, s2: str) -> float:
    """Computes Jaro distance between two strings."""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    if s1 == s2:
        return 1.0

    len1, len2 = len(s1), len(s2)
    match_distance = max(len1, len2) // 2 - 1
    if match_distance < 0:
        match_distance = 0

    s1_matches = [False] * len1
    s2_matches = [False] * len2

    matches = 0
    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] == s2[j]:
                s1_matches[i] = True
                s2_matches[j] = True
                matches += 1
                break

    if matches == 0:
        return 0.0

    # Count transpositions
    k = 0
    transpositions = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    return (
        (matches / len1) +
        (matches / len2) +
        ((matches - transpositions / 2) / matches)
    ) / 3.0


def jaro_winkler_similarity(s1: str, s2: str, p: float = 0.1, max_l: int = 4) -> float:
    """Computes Jaro-Winkler similarity."""
    j = jaro_distance(s1, s2)
    # Find length of common prefix up to max_l characters
    l = 0
    for c1, c2 in zip(s1[:max_l], s2[:max_l]):
        if c1 == c2:
            l += 1
        else:
            break
    return j + (l * p * (1.0 - j))


class TieredDeduplicator:
    """
    Implements Algorithm 3: Tiered Financial Transaction Deduplication.
    - Level 1: Deterministic unique key matching on RRN (length >= 6).
    - Level 2: Composite fuzzy-temporal matching when RRN is absent.
    """

    def __init__(self, time_window_seconds: int = 86400, similarity_threshold: float = 0.85):
        self.time_window_seconds = time_window_seconds
        self.similarity_threshold = similarity_threshold

    def evaluate_duplicate(
        self,
        new_txn: Dict[str, Any],
        existing_txns: List[Dict[str, Any]]
    ) -> Tuple[str, str, Optional[Any], Optional[float]]:
        """
        Evaluates whether new_txn is a duplicate against existing_txns.
        Returns (decision, reason, matched_id, similarity_score).
        decision is either 'INSERT' or 'DUPLICATE_DROP'.
        """
        rrn = new_txn.get("rrn")

        # Level 1: Deterministic unique key matching
        if rrn and len(str(rrn).strip()) >= 6:
            target_rrn = str(rrn).strip().upper()
            for item in existing_txns:
                existing_rrn = item.get("rrn")
                if existing_rrn and str(existing_rrn).strip().upper() == target_rrn:
                    return (
                        "DUPLICATE_DROP",
                        f"Exact RRN Match: {target_rrn}",
                        item.get("id"),
                        1.0
                    )
            return ("INSERT", "Unique RRN verified", None, None)

        # Level 2: Composite fuzzy-temporal matching (when RRN is missing)
        target_amt = new_txn.get("amount")
        target_type = new_txn.get("transaction_type")
        target_acc = new_txn.get("account_last_four")
        target_time = new_txn.get("timestamp") or 0
        target_merchant = (new_txn.get("merchant") or new_txn.get("upi_id") or "").lower().strip()

        if target_amt is None:
            return ("INSERT", "Incomplete transaction inserted without dedup constraint", None, None)

        for match in existing_txns:
            # Check amount equality
            m_amt = match.get("amount")
            if m_amt != target_amt:
                continue

            # Check transaction type
            m_type = match.get("transaction_type")
            if target_type and m_type and target_type != m_type:
                continue

            # Check account suffix if both present
            m_acc = match.get("account_last_four")
            if target_acc and m_acc and target_acc != m_acc:
                continue

            # Check temporal window (in epoch seconds or millis)
            m_time = match.get("timestamp") or 0
            # Normalize to seconds if in milliseconds
            t1 = target_time / 1000.0 if target_time > 1e11 else target_time
            t2 = m_time / 1000.0 if m_time > 1e11 else m_time

            if abs(t1 - t2) > self.time_window_seconds:
                continue

            # Check fuzzy similarity on merchant / UPI descriptor
            m_merchant = (match.get("merchant") or match.get("upi_id") or "").lower().strip()
            score = jaro_winkler_similarity(target_merchant, m_merchant)

            if score >= self.similarity_threshold:
                return (
                    "DUPLICATE_DROP",
                    f"Composite fuzzy-temporal duplicate match (Score: {score:.2f})",
                    match.get("id"),
                    score
                )

        return ("INSERT", "No duplicate signature matched", None, None)
