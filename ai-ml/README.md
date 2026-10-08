# FinSight AI — AI/ML Information Extraction Engine (SMS2Finance)

This directory contains the Python-based Machine Learning and Natural Language Processing service for the SMS2Finance project.

## Technology Stack
- **Framework**: FastAPI (Python 3.10+) / Uvicorn
- **Information Extraction**: Hybrid information extraction combining contextual NER token-classification with deterministic regex and rules.
- **Deduplication**: Algorithm 3 tiered deduplication (exact RRN match + temporal composite Jaro-Winkler fuzzy similarity).
- **Evaluation**: pandas, NumPy, scikit-learn, pytest.

## Architecture & Algorithms
- **Algorithm 1 (Edge Filter)**: Modeled and tested in `benchmark/ablation_runner.py` and implemented natively in `sms-android`. Refer to [`doc/17_FORMAL_ALGORITHMS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/17_FORMAL_ALGORITHMS.md).
- **Algorithm 2 (Entity Reconciliation)**: Located in `normalization/reconciliation.py`. Reconciles candidate sets from regex/rules and NER according to domain priority.
- **Algorithm 3 (Tiered Deduplication)**: Located in `deduplication/tiered_dedup.py`. Eliminates duplicate transactions while avoiding false merges.

## Directory Structure
```text
ai-ml/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI service endpoints (/health, /internal/parser/parse, /internal/parser/deduplicate)
│   └── models.py          # Pydantic schemas
├── rules/
│   ├── __init__.py
│   ├── regex_catalog.py   # Deterministic regex patterns for Amount, RRN, Account, UPI, Balances
│   └── rule_extractor.py  # Regex extraction engine
├── nlp/
│   ├── __init__.py
│   └── ner_engine.py      # Contextual NER token-classification engine (Merchants, intent)
├── normalization/
│   ├── __init__.py
│   └── reconciliation.py  # Algorithm 2 Conflict-Aware Reconciliation
├── deduplication/
│   ├── __init__.py
│   └── tiered_dedup.py    # Algorithm 3 Tiered Deduplication (RRN + Jaro-Winkler)
├── benchmark/
│   ├── __init__.py
│   ├── dataset_generator.py # Generates 2,500 benchmark messages across 6 Indian banks
│   └── ablation_runner.py   # Evaluates 5-stage ablation matrix (Ablation-A to E)
├── data/
│   └── benchmark_2500.json # Generated differentially anonymized benchmark dataset
├── tests/
│   └── test_parser.py     # Pytest test suite
└── requirements.txt
```

## Running the Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests
```bash
python -m pytest tests/ -v
```

## Running Benchmark & Ablation Study
```bash
python benchmark/ablation_runner.py
```

For full academic specifications and research evaluation, see:
- [`doc/07_AI_NLP_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/07_AI_NLP_SPEC.md)
- [`doc/08_RESEARCH_EVALUATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/08_RESEARCH_EVALUATION.md)
- [`doc/18_DATASET_BENCHMARK_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/18_DATASET_BENCHMARK_SPEC.md)
- [`doc/19_EXPERIMENTAL_SETUP_ABLATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/19_EXPERIMENTAL_SETUP_ABLATION.md)
