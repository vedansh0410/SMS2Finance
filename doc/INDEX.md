# FinSight AI (SMS2Finance) — Documentation Index

> **Welcome to the FinSight AI (SMS2Finance) Documentation Suite**  
> All 21 foundational and academic documentation files are maintained in this directory ([`doc/`](file:///c:/Users/HP/Downloads/SMS2Finance/doc)).

---

## 1. Master Documentation Catalog

| Document File | Title & Core Subject | Target Audience |
|---|---|---|
| [`00_READ_ME_FIRST.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/00_READ_ME_FIRST.md) | **Foundational Orientation & Rules** — Mandatory architectural boundaries, language policies, and research integrity. | All Contributors, AI Agents |
| [`01_PROJECT_OVERVIEW.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/01_PROJECT_OVERVIEW.md) | **Project Overview & Motivation** — Problem statement, UPI ecosystem, target entities, and high-level achievements. | General Audience, New Developers |
| [`02_ARCHITECTURE.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/02_ARCHITECTURE.md) | **System Architecture & Data Flow** — Multi-tier design, layer responsibilities, sequence flows, and network boundaries. | System Architects, Backend Leads |
| [`03_TECH_STACK.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/03_TECH_STACK.md) | **Technology Stack & Versions** — Complete dependency matrix across Android, Spring Boot, Python ML, React, and DB. | Full-Stack Engineers |
| [`04_MODULES.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/04_MODULES.md) | **Module Directory & Code Map** — Exhaustive code-level map of packages, classes, controllers, and services. | Developers, Code Reviewers |
| [`05_DATA_MODEL.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/05_DATA_MODEL.md) | **Data Model & Relational Schemas** — PostgreSQL DDL, JPA mappings, indexing strategy, and field definitions. | Database Admins, Backend Devs |
| [`06_API_CONTRACTS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/06_API_CONTRACTS.md) | **REST API Contracts** — Request/response schemas, JSON payloads, and status codes for all endpoints. | API Consumers, Frontend Devs |
| [`07_AI_NLP_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/07_AI_NLP_SPEC.md) | **AI/NLP Extraction Specification** — Hybrid extraction design, regex catalog, contextual NER, and provenance. | ML Engineers, NLP Researchers |
| [`08_RESEARCH_EVALUATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/08_RESEARCH_EVALUATION.md) | **Research & Empirical Evaluation** — Research questions, baseline models, ablation findings, and verified numbers. | Academic Researchers, Reviewers |
| [`09_TESTING.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/09_TESTING.md) | **Multi-Tier Testing Strategy** — Android, Spring Boot, and Python pytest suites, edge cases, and test commands. | QA Engineers, Developers |
| [`10_SECURITY_PRIVACY.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/10_SECURITY_PRIVACY.md) | **Security & Privacy Architecture** — Edge filtering privacy barrier, differential anonymization, and hardening. | Security Engineers, Compliance |
| [`11_FRONTEND_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/11_FRONTEND_SPEC.md) | **Frontend Dashboard Specification** — React 18 / TypeScript architecture, Recharts analytics, and provenance UI. | Frontend Developers, Designers |
| [`12_DEVELOPMENT_INSTRUCTIONS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/12_DEVELOPMENT_INSTRUCTIONS.md) | **Development Instructions** — Engineering rules, adding new bank templates, branching conventions, and checks. | Active Contributors, AI Agents |
| [`13_SETUP_RUNBOOK.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/13_SETUP_RUNBOOK.md) | **Setup & Operational Runbook** — Prerequisites, local startup sequence, configuration, and troubleshooting. | DevOps, Local Evaluators |
| [`14_RESEARCH_PAPER.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/14_RESEARCH_PAPER.md) | **Academic Paper Blueprint** — Recommended venues (IEEE, ACM, FinNLP), paper structure, and contributions. | Academic Authors |
| [`15_LIMITATIONS_FUTURE.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/15_LIMITATIONS_FUTURE.md) | **Limitations & Future Roadmap** — Multilingual SMS, split SMS, Android Doze mode, and on-device NER roadmap. | Product Managers, Researchers |
| [`16_GLOSSARY.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/16_GLOSSARY.md) | **Technical & Domain Glossary** — 40+ formal definitions across UPI, banking, NLP, and distributed systems. | All Readers |
| [`17_FORMAL_ALGORITHMS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/17_FORMAL_ALGORITHMS.md) | **Formal Algorithmic Formulations** — Mathematical formulations, pseudocode, and complexities for Algorithms 1, 2, 3. | Computer Scientists, Reviewers |
| [`18_DATASET_BENCHMARK_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/18_DATASET_BENCHMARK_SPEC.md) | **Dataset & Benchmark Specification** — 2,500 message benchmark schema, bank splits, and IOB2 token tagging. | Data Scientists, Benchmarkers |
| [`19_EXPERIMENTAL_SETUP_ABLATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/19_EXPERIMENTAL_SETUP_ABLATION.md) | **Experimental Setup & Ablation Matrix** — 5-stage ablation matrix protocol, metric formulas, and findings. | Experimental Evaluators |
| [`20_RESEARCH_PAPER_SKELETON.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/20_RESEARCH_PAPER_SKELETON.md) | **IEEE Conference LaTeX Skeleton** — Ready-to-compile IEEEtran paper skeleton with tables, algorithms, and citations. | Manuscript Drafters |

---

## 2. Recommended Reading Paths

### Path A: Quick Developer Setup & Evaluation
1. Start with [`13_SETUP_RUNBOOK.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/13_SETUP_RUNBOOK.md) to initialize the local services (PostgreSQL, Python ML, Spring Boot, React).
2. Review [`06_API_CONTRACTS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/06_API_CONTRACTS.md) for endpoint specifications.
3. Check [`09_TESTING.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/09_TESTING.md) to run verification test suites.

### Path B: Academic Reviewer & Research Understanding
1. Read [`01_PROJECT_OVERVIEW.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/01_PROJECT_OVERVIEW.md) for problem context.
2. Examine [`17_FORMAL_ALGORITHMS.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/17_FORMAL_ALGORITHMS.md) for formal algorithmic definitions.
3. Review [`08_RESEARCH_EVALUATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/08_RESEARCH_EVALUATION.md) and [`19_EXPERIMENTAL_SETUP_ABLATION.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/19_EXPERIMENTAL_SETUP_ABLATION.md) for empirical results.
4. Inspect the LaTeX manuscript skeleton in [`20_RESEARCH_PAPER_SKELETON.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/20_RESEARCH_PAPER_SKELETON.md).

### Path C: Deep Architecture & Security Review
1. Read [`02_ARCHITECTURE.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/02_ARCHITECTURE.md) and [`04_MODULES.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/04_MODULES.md).
2. Examine [`05_DATA_MODEL.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/05_DATA_MODEL.md) for database design.
3. Review [`10_SECURITY_PRIVACY.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/10_SECURITY_PRIVACY.md) for edge privacy guarantees.
