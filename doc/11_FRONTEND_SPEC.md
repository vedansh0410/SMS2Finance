# FinSight AI (SMS2Finance) — Frontend Dashboard Specification

> **Document Scope**: React application architecture, component hierarchy, UI/UX design system, visualization charts, and API client integration.  
> **Source Directory**: [`frontend/src/`](file:///c:/Users/HP/Downloads/SMS2Finance/frontend/src)

---

## 1. Frontend Technology Stack & Design System

* **Core Runtime**: React 18.3.1 with TypeScript 5.6.3.
* **Build System**: Vite 5.4.11 (Hot Module Replacement, fast ES module bundling).
* **Styling**: Tailwind CSS 3.4.15 with custom glassmorphism, responsive grid layouts, and slate dark-mode palette.
* **Data Visualization**: Recharts 2.13.3 (SVG-based responsive Area, Pie, and Bar charts).
* **Iconography**: Lucide React 0.460.0.

---

## 2. Component Hierarchy & Architectural Structure

```text
frontend/src/
├── App.tsx                     # Master state coordinator & view switcher
├── index.css                   # Global Tailwind utilities & custom glassmorphism styles
├── components/
│   ├── Navbar.tsx              # Top navigation header & backend connection indicator
│   ├── KpiCards.tsx            # Liquidity & transaction summary cards
│   ├── AccountSelector.tsx     # Multi-account selector pills with real-time balance metrics
│   ├── AnalyticsCharts.tsx     # Recharts AreaChart, PieChart, and BarChart
│   ├── TransactionTable.tsx    # Filterable ledger explorer with live search and pagination
│   ├── TransactionModal.tsx    # Entity provenance & confidence inspection modal
│   ├── SmsIngestionFeed.tsx    # Raw SMS ingestion monitor & re-parsing coordinator
│   └── ResearchBenchmarkModal.tsx # Empirical ablation evaluation modal (Ablation A to E)
├── services/
│   └── api.ts                  # REST client with automatic fallback to benchmark dataset
└── types/
    └── index.ts                # TypeScript interfaces aligned with backend DTOs
```

---

## 3. UI Component Breakdown

### 3.1 Overview KPIs (`KpiCards.tsx`)
Renders four executive summary cards:
1. **Total Outflow (Spent)**: Cumulative debit transactions with monthly trend delta.
2. **Total Inflow (Received)**: Cumulative credit deposits (salary, refunds, transfers).
3. **Net Liquidity (Net Flow)**: Real-time difference ($Inflow - Outflow$) with dynamic color-coding (Emerald for positive, Rose for negative).
4. **Transaction Volume**: Total structured transaction count alongside raw SMS ingestion tally.

### 3.2 Account Selector (`AccountSelector.tsx`)
Allows users to toggle between **All Accounts** or isolate specific accounts (e.g., `Indian Bank **1541`, `HDFC Bank **4821`). Re-calculates all dashboard statistics in real time based on the active selection.

### 3.3 Visual Analytics Suite (`AnalyticsCharts.tsx`)
* **Cash Flow Trajectory (AreaChart)**: Visualizes debit outflows and credit inflows over time with smooth bezier curves and gradient fills.
* **Bank Volume Distribution (PieChart)**: Donut breakdown illustrating financial institution market shares.
* **Top Merchant Leaderboard (BarChart)**: Horizontal expenditure bars highlighting top counterparties (e.g., Swiggy, Amazon, Reliance Digital).

### 3.4 Transaction Ledger Explorer (`TransactionTable.tsx`)
* **Interactive Filtering**: Filter by transaction direction (`All`, `Debits`, `Credits`) and banking institution (`All`, `HDFC`, `SBI`, `ICICI`).
* **Live Search**: Debounced instant search across merchant names, 12-digit RRNs, account suffixes, and bank titles.
* **Provenance Trigger**: Clicking any transaction row opens the detailed provenance modal.

### 3.5 Extraction Provenance Modal (`TransactionModal.tsx`)
Provides complete explainability for the hybrid extraction framework:
* Displays extracted entities with **source badges**:
  - `REGEX`: Extracted via deterministic regular expression pattern.
  - `NER`: Extracted via statistical contextual token classification.
  - `RULE`: Extracted via keyword rule.
  - `RECONCILED`: Reconciled via Algorithm 2.
* Renders a percentage **confidence meter** and highlights the exact character span.

### 3.6 Android Ingestion Feed Monitor (`SmsIngestionFeed.tsx`)
Tracks raw SMS ingested from mobile edge devices:
* Real-time lifecycle badges: `PARSED`, `PENDING`, `SKIPPED_NON_TXN`, `DUPLICATE_DROPPED`.
* One-click trigger for backend re-parsing (`POST /api/transactions/reparse-all`).

### 3.7 Research Benchmark Modal (`ResearchBenchmarkModal.tsx`)
Interactive academic evaluation view displaying:
* Live empirical results across the 5-stage ablation matrix (**Ablation A through E**).
* Edge bandwidth reduction ratio ($\Delta_{BW} = 32.91\%$) and macro extraction F1-score ($0.9400$).

---

## 4. API Client & Resilient Offline Fallback (`api.ts`)

The dashboard connects to Spring Boot at `http://localhost:8080/api`. To ensure seamless demonstration and testing even when local backend services are offline, `api.ts` features **automatic graceful fallback**:
* Network fetch calls to `/api/transactions`, `/api/transactions/summary`, and `/api/analytics/*` catch connection errors transparently.
* If the backend is unreachable, the client displays verified, realistic benchmark data without throwing unhandled exceptions.
