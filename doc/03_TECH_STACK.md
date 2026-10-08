# FinSight AI (SMS2Finance) — Technology Stack

> **Document Scope**: Complete technology inventory, library versions, architectural justification, and boundary rules across all layers.  
> **Related Files**: [`pom.xml`](file:///c:/Users/HP/Downloads/SMS2Finance/smssyncserverBACKEND/pom.xml), [`requirements.txt`](file:///c:/Users/HP/Downloads/SMS2Finance/ai-ml/requirements.txt), [`package.json`](file:///c:/Users/HP/Downloads/SMS2Finance/frontend/package.json), [`build.gradle`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/build.gradle)

---

## 1. Full-Stack Technology Matrix

| Layer | Technology | Version | Key Responsibility / Justification |
|---|---|---|---|
| **Android Client** | **Java (Android SDK)** | API 34 (Android 14) | Native mobile edge execution, telephony cursor access, low-overhead heuristic filtering. |
| Android Tooling | Android Studio & Gradle | Gradle 8.x / AGP 8.x | Android compilation, packaging, and unit test execution. |
| Android Telephony | `android.provider.Telephony` | Native SDK | Secure device-level querying of incoming SMS database via ContentResolver. |
| Android Persistence | `SharedPreferences` | Native SDK | Lightweight, fault-tolerant persistence of local synchronization checkpoint (`lastSync`). |
| Android Networking | **Retrofit + OkHttp** | Retrofit 2.9.0 | Type-safe REST client for sequential HTTP POST uploads with network retry and logging. |
| **Backend Core** | **Java** | **Java 21 (LTS)** | High-throughput, strongly typed backend runtime with modern language enhancements. |
| Backend Framework | **Spring Boot** | 4.1.0 / 3.x | Enterprise REST controllers, dependency injection, and application lifecycle management. |
| Backend Persistence | **Spring Data JPA & Hibernate** | Jakarta Persistence 3.1 | Object-relational mapping, transactional safety, and optimized index creation. |
| Backend HTTP Client| **Spring `RestClient`** | Native Spring 6.1+ | Synchronous, non-blocking HTTP REST client for orchestrating Python ML parser invocations. |
| Backend Validation | **Jakarta Bean Validation** | Hibernate Validator 8.x | Schema-level validation for incoming DTO payloads (`@NotBlank`, `@NotNull`). |
| Backend Tooling | **Apache Maven** | Maven 3.9+ | Build lifecycle, dependency resolution, compiler plugin, and test runner. |
| **Database** | **PostgreSQL** | 14+ / 16.x | Robust ACID-compliant relational storage for raw SMS audit logs and parsed transaction ledgers. |
| **AI / ML Service** | **Python** | **Python 3.10+** | Specialized scientific and NLP ecosystem for token classification and entity reconciliation. |
| ML API Framework | **FastAPI + Uvicorn** | FastAPI 0.115+ / Starlette | Asynchronous, OpenAPI-compliant high-performance microservice endpoints. |
| Data Validation | **Pydantic** | v2.9+ | High-speed data parsing, serialization, and typing enforcement for ML inputs/outputs. |
| Deterministic Rules | **Python `re` (Regular Expressions)**| Standard Library | Sub-millisecond deterministic extraction of structured tokens (currency amounts, RRNs, accounts, VPAs). |
| Contextual NER | **spaCy & Token Classifiers** | spaCy 3.7+ / PyTorch | Statistical entity recognition for variable phrasing and contextual merchant name tokens. |
| Deduplication & Math| **Levenshtein / Jaro-Winkler** | Custom Algorithm 3 | Algorithmic string similarity comparison for merchant names within temporal windows. |
| Evaluation & Data | **pandas, NumPy, scikit-learn** | Latest Stable | Benchmark dataset generation, metric calculations (Precision, Recall, Macro F1), and ablation runs. |
| Python Testing | **pytest** | pytest 8.x | Comprehensive unit and integration test suite covering rules, reconciliation, and dedup. |
| **Frontend UI** | **React** | 18.3.1 | Declarative component hierarchy and dynamic state management. |
| Build Tool | **Vite** | 5.4.11 | Ultra-fast Hot Module Replacement (HMR) and optimized ES module bundling. |
| Language | **TypeScript** | 5.6.3 | End-to-end type safety aligning UI components with Spring Boot DTO contracts. |
| Styling | **Tailwind CSS** | 3.4.15 | Utility-first CSS framework with custom glassmorphism, responsive grids, and dark palettes. |
| Data Visualization | **Recharts** | 2.13.3 | Responsive SVG-based charts for spending trends (AreaChart), bank shares (PieChart), and merchants (BarChart). |
| Icons | **Lucide React** | 0.460.0 | Consistent modern iconography for transaction types, financial indicators, and status badges. |

---

## 2. Technology Selection Rationale

### 2.1 Why Java for Android and Spring Boot?
* **Native Android Stability**: Java provides stable access to Android's Telephony ContentResolver without multiplatform overhead, ensuring minimal battery and memory impact when executing Algorithm 1 at the edge.
* **Enterprise Ingestion Performance**: Spring Boot delivers battle-tested transaction management, multi-threaded connection pooling, and seamless JPA integration for database operations.

### 2.2 Why Python for AI/ML and NLP?
* **Rich NLP Ecosystem**: Python provides access to foundational libraries (spaCy, Hugging Face Transformers, PyTorch, scikit-learn) required for contextual token classification and ablation benchmarking.
* **Separation of Concerns**: Encapsulating extraction logic inside a dedicated FastAPI microservice isolates heavy computational workloads from the Spring Boot ingestion pipeline.

### 2.3 Why React 18, TypeScript, and Vite?
* **Interactive Financial Analytics**: Rapid filtering, real-time KPI re-computations, and provenance inspection require reactive, component-level state updates.
* **Contract Fidelity**: TypeScript interfaces guarantee that frontend components render valid backend transaction schemas without runtime type errors.

### 2.4 Why PostgreSQL?
* **Financial Ledger Integrity**: ACID compliance prevents ledger corruption during high-concurrency ingestion.
* **Relational Querying**: Indexing on `rrn`, `payment_date`, `bank_name`, and `raw_sms_id` enables rapid sub-millisecond aggregations for analytics charts.

---

## 3. Strict Boundary Rules

1. **No Mixed Runtimes in Microservices**:
   - The Spring Boot backend remains 100% Java. Python is not embedded via Jython or subprocess calls.
   - The AI/ML service remains 100% Python.
2. **Frontend Database Isolation**:
   - The frontend communicates solely with Spring Boot REST endpoints. Direct database drivers or Supabase/Firebase connections are strictly prohibited.
3. **Regex Is Not an AI Model**:
   - Regular expressions are classified as **deterministic rules**. The extraction architecture is formally termed a **hybrid information extraction framework combining contextual NER with deterministic rules**.
