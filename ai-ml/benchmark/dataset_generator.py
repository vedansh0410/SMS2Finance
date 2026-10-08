import random
import json
import os
from typing import List, Dict, Any

BANKS = [
    {"code": "SBI", "header": "SBIINB", "name": "State Bank of India"},
    {"code": "HDFC", "header": "HDFCBK", "name": "HDFC Bank"},
    {"code": "ICICI", "header": "ICICIB", "name": "ICICI Bank"},
    {"code": "AXIS", "header": "AXISBK", "name": "Axis Bank"},
    {"code": "PNB", "header": "PNBSMS", "name": "Punjab National Bank"},
    {"code": "BOB", "header": "BOBTXN", "name": "Bank of Baroda"},
]

MERCHANTS = [
    "Swiggy", "Zomato", "Amazon", "Flipkart", "Uber", "Blinkit", "Zepto",
    "Starbucks", "BookMyShow", "Reliance Digital", "DMart", "Myntra"
]

UPI_HANDLES = ["okhdfcbank", "oksbi", "icici", "axisbank", "paytm", "upi"]


def generate_synthetic_rrn() -> str:
    # 12 digit standard RRN/UTR
    return str(random.randint(300000000000, 399999999999))


def generate_account_num() -> str:
    return f"XX{random.randint(1000, 9999)}"


def generate_amount() -> float:
    return round(random.choice([49.0, 99.0, 150.0, 249.50, 499.0, 1200.0, 2450.0, 5000.0, 15200.0]), 2)


def generate_benchmark_dataset(target_total: int = 2500) -> List[Dict[str, Any]]:
    """
    Generates a stratified, differentially anonymized benchmark dataset conforming to:
    18_DATASET_BENCHMARK_SPEC.md
    """
    dataset: List[Dict[str, Any]] = []

    # Category counts
    count_debit_upi = int(0.35 * target_total)  # 875
    count_debit_card = int(0.15 * target_total) # 375
    count_credit = int(0.20 * target_total)     # 500
    count_otp = int(0.15 * target_total)        # 375
    count_promo = target_total - (count_debit_upi + count_debit_card + count_credit + count_otp) # 375

    base_time = 1728000000000  # Epoch millis reference

    # 1. Debit (UPI)
    for i in range(count_debit_upi):
        bank = random.choice(BANKS)
        amt = generate_amount()
        acc = generate_account_num()
        rrn = generate_synthetic_rrn()
        merchant = random.choice(MERCHANTS)
        upi_vpa = f"{merchant.lower().replace(' ', '')}@{random.choice(UPI_HANDLES)}"
        bal = round(random.uniform(500, 50000), 2)

        msg = f"Rs. {amt:.2f} debited from A/c {acc} to {merchant} via UPI. UPI Ref: {rrn}. Avl Bal: Rs. {bal:.2f}."
        dataset.append({
            "id": len(dataset) + 1,
            "category": "DEBIT_UPI",
            "is_financial_transaction": True,
            "sender": bank["header"],
            "bank_name": bank["name"],
            "message": msg,
            "timestamp": base_time + (i * 60000),
            "ground_truth": {
                "amount": amt,
                "transaction_type": "DEBIT",
                "account_last_four": acc[-4:],
                "rrn": rrn,
                "merchant": merchant,
                "upi_id": None,
                "bank_balance": bal,
                "bank_name": bank["name"]
            }
        })

    # 2. Debit (Card/ATM/NetBanking)
    for i in range(count_debit_card):
        bank = random.choice(BANKS)
        amt = generate_amount()
        acc = generate_account_num()
        rrn = generate_synthetic_rrn()
        merchant = random.choice(MERCHANTS)
        bal = round(random.uniform(500, 50000), 2)

        msg = f"Alert: Rs. {amt:.2f} spent on Card ending in {acc[-4:]} at {merchant}. Txn ID: {rrn}. Available balance is INR {bal:.2f}."
        dataset.append({
            "id": len(dataset) + 1,
            "category": "DEBIT_CARD_ATM",
            "is_financial_transaction": True,
            "sender": bank["header"],
            "bank_name": bank["name"],
            "message": msg,
            "timestamp": base_time + (i * 70000),
            "ground_truth": {
                "amount": amt,
                "transaction_type": "DEBIT",
                "account_last_four": acc[-4:],
                "rrn": rrn,
                "merchant": merchant,
                "upi_id": None,
                "bank_balance": bal,
                "bank_name": bank["name"]
            }
        })

    # 3. Credit (Salary/Refund/UPI)
    for i in range(count_credit):
        bank = random.choice(BANKS)
        amt = generate_amount()
        acc = generate_account_num()
        rrn = generate_synthetic_rrn()
        sender_entity = random.choice(["Employer Corp", "Refund Portal", "user123@upi", "Zomato"])
        bal = round(random.uniform(1000, 100000), 2)

        msg = f"Your A/c {acc} has been credited with INR {amt:.2f} by {sender_entity}. Ref no: {rrn}. Avl Bal: INR {bal:.2f}."
        dataset.append({
            "id": len(dataset) + 1,
            "category": "CREDIT",
            "is_financial_transaction": True,
            "sender": bank["header"],
            "bank_name": bank["name"],
            "message": msg,
            "timestamp": base_time + (i * 80000),
            "ground_truth": {
                "amount": amt,
                "transaction_type": "CREDIT",
                "account_last_four": acc[-4:],
                "rrn": rrn,
                "merchant": sender_entity if "@" not in sender_entity else None,
                "upi_id": sender_entity if "@" in sender_entity else None,
                "bank_balance": bal,
                "bank_name": bank["name"]
            }
        })

    # 4. Transactional Distractors (OTP)
    for i in range(count_otp):
        bank = random.choice(BANKS)
        otp = random.randint(100000, 999999)
        amt = generate_amount()
        acc = generate_account_num()

        msg = f"Your OTP for transaction of Rs. {amt:.2f} on Card ending in {acc[-4:]} is {otp}. Do NOT share this OTP with anyone."
        dataset.append({
            "id": len(dataset) + 1,
            "category": "DISTRACTOR_OTP",
            "is_financial_transaction": False,
            "sender": bank["header"],
            "bank_name": bank["name"],
            "message": msg,
            "timestamp": base_time + (i * 90000),
            "ground_truth": None
        })

    # 5. Informational / Promotional Distractors
    for i in range(count_promo):
        bank = random.choice(BANKS)
        limit = random.choice([50000, 100000, 200000])

        msg = f"Congratulations! You are pre-approved for a personal loan up to Rs. {limit} from {bank['name']}. Apply now at link or call +91-9876543210."
        dataset.append({
            "id": len(dataset) + 1,
            "category": "PROMOTIONAL",
            "is_financial_transaction": False,
            "sender": bank["header"],
            "bank_name": bank["name"],
            "message": msg,
            "timestamp": base_time + (i * 95000),
            "ground_truth": None
        })

    random.shuffle(dataset)
    return dataset


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "benchmark_2500.json")

    print(f"Generating 2,500 benchmark messages into {out_path}...")
    dataset = generate_benchmark_dataset(2500)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
    print(f"Successfully generated {len(dataset)} messages.")
