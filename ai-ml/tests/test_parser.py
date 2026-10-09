import pytest
import sys
import os

# Include parent directory in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rules.rule_extractor import DeterministicRuleExtractor
from nlp.ner_engine import FinancialNerEngine
from normalization.reconciliation import EntityReconciler
from deduplication.tiered_dedup import TieredDeduplicator, jaro_winkler_similarity
from benchmark.ablation_runner import edge_filter_l1


def test_rule_extractor_hdfc_upi():
    extractor = DeterministicRuleExtractor()
    sender = "HDFCBK"
    msg = "Rs. 750.50 debited from A/c XX1234 to Swiggy via UPI. UPI Ref: 312345678901. Avl Bal: Rs. 14200.00."

    candidates = extractor.extract(sender, msg)
    types = {c["entity_type"]: c["value"] for c in candidates}

    assert types["BANK_NAME"] == "HDFC Bank"
    assert types["AMOUNT"] == "750.50"
    assert types["ACC_NUM"] == "1234"
    assert types["RRN"] == "312345678901"
    assert types["TXN_TYPE"] == "DEBIT"
    assert types["BALANCE"] == "14200.00"


def test_ner_engine_merchant_extraction():
    engine = FinancialNerEngine()
    msg = "Rs. 450 debited from a/c XX5678 to Zomato on 24-03-24. Avl bal Rs 5000."
    entities = engine.predict_entities(msg)

    merchant = next((e for e in entities if e["entity_type"] == "MERCHANT"), None)
    assert merchant is not None
    assert merchant["value"] == "Zomato"


def test_algorithm_2_entity_reconciliation():
    reconciler = EntityReconciler(theta_ner=0.75)

    e_reg = [
        {"entity_type": "AMOUNT", "value": "1500.00", "source": "REGEX", "confidence": 0.95},
        {"entity_type": "RRN", "value": "987654321012", "source": "REGEX", "confidence": 0.98},
        {"entity_type": "ACC_NUM", "value": "4321", "source": "REGEX", "confidence": 0.97},
        {"entity_type": "TXN_TYPE", "value": "DEBIT", "source": "RULE", "confidence": 0.90},
    ]

    e_ner = [
        {"entity_type": "MERCHANT", "value": "Starbucks Coffee", "source": "NER", "confidence": 0.89},
        {"entity_type": "TXN_TYPE", "value": "DEBIT", "source": "NER", "confidence": 0.92},
        {"entity_type": "AMOUNT", "value": "1500", "source": "NER", "confidence": 0.80},
    ]

    timestamp = 1728000000000
    res = reconciler.reconcile(e_reg, e_ner, timestamp)

    assert res["amount"] == 1500.0
    assert res["rrn"] == "987654321012"
    assert res["account_last_four"] == "4321"
    assert res["merchant"] == "Starbucks Coffee"
    assert res["transaction_type"] == "DEBIT"
    assert res["validation_status"] == "VALID"
    assert res["extraction_confidence"] >= 0.90


def test_algorithm_3_tiered_deduplication():
    dedup = TieredDeduplicator(time_window_seconds=3600, similarity_threshold=0.85)

    existing = [
        {
            "id": 1,
            "amount": 250.0,
            "rrn": "312345678901",
            "account_last_four": "1234",
            "transaction_type": "DEBIT",
            "merchant": "Swiggy",
            "timestamp": 1728000000000
        }
    ]

    # Test Level 1: RRN exact match
    new_txn_1 = {
        "amount": 250.0,
        "rrn": "312345678901",
        "account_last_four": "1234",
        "transaction_type": "DEBIT",
        "merchant": "Swiggy",
        "timestamp": 1728000005000
    }
    decision, reason, matched_id, _ = dedup.evaluate_duplicate(new_txn_1, existing)
    assert decision == "DUPLICATE_DROP"
    assert matched_id == 1

    # Test Level 2: Fuzzy composite match when RRN is missing
    existing_no_rrn = [
        {
            "id": 2,
            "amount": 350.0,
            "rrn": None,
            "account_last_four": "5678",
            "transaction_type": "DEBIT",
            "merchant": "Amazon India",
            "timestamp": 1728000000000
        }
    ]
    new_txn_2 = {
        "amount": 350.0,
        "rrn": None,
        "account_last_four": "5678",
        "transaction_type": "DEBIT",
        "merchant": "Amazon Pay",
        "timestamp": 1728000060000
    }
    decision2, reason2, matched_id2, score2 = dedup.evaluate_duplicate(new_txn_2, existing_no_rrn)
    assert decision2 == "DUPLICATE_DROP"
    assert matched_id2 == 2
    assert score2 >= 0.85

    # Test Distinct Transaction (different amount)
    new_txn_distinct = {
        "amount": 999.0,
        "rrn": "999999999999",
        "account_last_four": "1234",
        "transaction_type": "DEBIT",
        "merchant": "Swiggy",
        "timestamp": 1728000005000
    }
    decision3, _, _, _ = dedup.evaluate_duplicate(new_txn_distinct, existing)
    assert decision3 == "INSERT"


def test_edge_filter_l1_drops_otp():
    sender = "SBIINB"
    otp_msg = "Your OTP for transaction of Rs. 500.00 is 492019. Do not share OTP."
    assert edge_filter_l1(sender, otp_msg) is False


def test_edge_filter_l1_retains_valid_transaction():
    sender = "SBIINB"
    txn_msg = "Rs 1,200.00 debited from A/c XX1234 on 05-Oct-24 to Swiggy. Avl Bal: Rs 4,500.00."
    assert edge_filter_l1(sender, txn_msg) is True


def test_merchant_cleaning_with_rrn_suffix():
    ner = FinancialNerEngine()
    reconciler = EntityReconciler(theta_ner=0.75)
    rule_ext = DeterministicRuleExtractor()

    test_cases = [
        ("Sent Rs.20.00 from A/c *1541 on 05-10-26 to RAM BABU.RRN 627807039010.Avl Bal Rs.3556.82.Not you?SMS BLOCK to 9289592895-Indian Bank", "Ram Babu"),
        ("Sent Rs.20.00 from A/c *1541 on 23-09-26 to Maxfry.RRN 626624446639.Avl Bal Rs.4133.12.Not you?SMS BLOCK to 9289592895-Indian Bank", "Maxfry"),
        ("Sent Rs.47.00 from A/c *1541 on 22-09-26 to AJAY CAFE.RRN 663119670082.Avl Bal Rs.4263.12.Not you?SMS BLOCK to 9289592895-Indian Bank", "Ajay Cafe"),
        ("Sent Rs.60.00 from A/c *1541 on 14-09-26 to FARMAN.RRN 662399294901.Avl Bal Rs.2033.12.Not you?SMS BLOCK to 9289592895-Indian Bank", "Farman"),
        ("Sent Rs.215.00 from A/c *1541 on 12-09-26 to ZOMATO.RRN 314525473853.Avl Bal Rs.2093.12.Not you?SMS BLOCK to 9289592895-Indian Bank", "Zomato"),
    ]

    for msg, expected_merchant in test_cases:
        e_reg = rule_ext.extract("VM-INDBNK-S", msg)
        e_ner = ner.predict_entities(msg)
        reconciled = reconciler.reconcile(e_reg, e_ner)
        assert reconciled["merchant"] == expected_merchant
        # Ensure RRN or Avl was NOT included in the merchant
        assert "rrn" not in reconciled["merchant"].lower()
        assert "avl" not in reconciled["merchant"].lower()

