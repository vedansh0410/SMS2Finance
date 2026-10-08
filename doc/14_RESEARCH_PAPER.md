# FinSight AI (SMS2Finance) — Academic Research Paper Mapping

> **Document Scope**: Academic publication blueprint, target venues, formal contributions, and section-by-section writing guide.  
> **LaTeX Manuscript**: [`doc/20_RESEARCH_PAPER_SKELETON.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/20_RESEARCH_PAPER_SKELETON.md)

---

## 1. Paper Title & Target Venues

### Recommended Title
**SMS2Finance: An Edge-Filtered Hybrid NER and Rule-Based Framework for Structured Financial Transaction Extraction from Bank SMS**

### Recommended Publication Venues
* **IEEE International Conference on Big Data (IEEE BigData)** — Industry & Applications Track.
* **ACM International Conference on Information and Knowledge Management (CIKM)** — Applied Research Track.
* **EMNLP FinNLP Workshop (Financial Technology and Natural Language Processing)**.
* **IEEE International Conference on Data Engineering (ICDE)** — Demo / Short Paper Track.

---

## 2. Core Scientific & Engineering Contributions

The manuscript highlights five distinct contributions:

1. **Edge-Side Heuristic Filtering (Algorithm 1)**: Proves that mobile edge preprocessing reduces edge-to-server data transmission by **32.91%** while maintaining a **0.0% False Negative Rate**, safeguarding user privacy and eliminating server-side ingestion bloat.
2. **Success-Gated Incremental Synchronization**: Establishes a fault-tolerant edge checkpointing protocol (`lastSync`) that ensures zero message loss and prevents redundant ingestion cycles across intermittent network connections.
3. **Conflict-Aware Entity Reconciliation (Algorithm 2)**: Formulates an entity fusion algorithm that leverages deterministic priority for structured fields (amounts, accounts, RRNs) and contextual priority for high-variance tokens (merchants, intent), achieving **0.9400 Macro F1**.
4. **Tiered Financial Deduplication (Algorithm 3)**: Introduces a two-tier deduplication algorithm combining deterministic RRN matching with temporal composite Jaro-Winkler string similarity, achieving a **0.0% False-Merge Rate**.
5. **Open Benchmark Specification & Differential Anonymization**: Releases a standardized schema and evaluation protocol for a stratified **2,500-message benchmark** across 6 major banking institutions without compromising real consumer PII.

---

## 3. Section-by-Section Manuscript Outline

```text
1. Introduction
   ├── Ubiquity of banking SMS in UPI and emerging FinTech economies
   ├── The Trilemma: High distractor noise, privacy exposure, and template shift
   └── Summary of four core contributions

2. Related Work
   ├── Personal Financial Management (PFM) and transaction mining
   ├── Named Entity Recognition (NER) in semi-structured text
   └── Edge computing and privacy-preserving data ingestion

3. System Architecture
   ├── End-to-end multi-tier pipeline: Android -> Spring Boot -> PostgreSQL -> FastAPI -> React
   └── Synchronization invariants and transaction ledger design

4. Methodology & Formal Algorithms
   ├── Algorithm 1: Edge-Device Level-1 Bank Transaction Filter
   ├── Algorithm 2: Conflict-Aware Entity Reconciliation
   └── Algorithm 3: Tiered Financial Transaction Deduplication

5. Experimental Evaluation
   ├── Benchmark dataset curation and differential anonymization protocol
   ├── Baseline models: Rule-only, spaCy NER, Transformer encoders
   ├── Five-stage ablation study (Ablation-A to Ablation-E)
   └── Quantitative results (Macro F1, FNR, Bandwidth Reduction Ratio)

6. Error Analysis & Discussion
   ├── Analysis of ambiguous merchant descriptors and non-standard symbols
   └── Edge vs. cloud trade-offs, compute constraints, and privacy implications

7. Conclusion & Future Work
   └── Summary of findings and roadmap for on-device lightweight NER
```
