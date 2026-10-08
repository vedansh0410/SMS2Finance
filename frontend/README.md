# FinSight AI — Frontend Dashboard (SMS2Finance)

Modern React / TypeScript / Tailwind CSS financial intelligence dashboard for the SMS2Finance framework.

## Technology Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism design system
- **Visualization**: Recharts (Responsive Area, Pie, Bar charts)
- **Icons**: Lucide React

## Architecture & Security Boundary
The dashboard interacts **only** with the Spring Boot Java Backend (`http://localhost:8080/api`).
Per [11_FRONTEND_SPEC.md](file:///c:/Users/HP/Downloads/SMS2Finance/doc/11_FRONTEND_SPEC.md), the frontend **never** connects directly to PostgreSQL.

## Features
- **Overview & Analytics**:
  - Outflow (Debits), Inflow (Credits), Net Liquidity KPI cards
  - Real-time spending vs. income trend lines
  - Bank distribution breakdown (HDFC, SBI, ICICI, etc.)
  - Top merchant expenditure leaderboard
- **Transactions Explorer**:
  - Live search across merchants, RRNs, banks, and UPI IDs
  - Filter by transaction type (Debits, Credits) and bank
  - Pagination and quick inspection
- **Transaction Provenance Modal**:
  - Displays exact entity extraction source (NER vs. REGEX vs. RULE vs. RECONCILED)
  - Extraction confidence percentage meter
  - Reconciled values conforming to Algorithm 2
- **Android Ingestion Monitor**:
  - Displays raw SMS ingested sequentially from Android client
  - Processing statuses: `PARSED`, `PENDING`, `DUPLICATE_DROPPED`, `SKIPPED_NON_TXN`
- **Research Benchmark Matrix**:
  - Live empirical evaluation of 5-Stage Ablation Matrix (Ablation A to E)
  - Bandwidth reduction ratio ($\Delta_{BW} = 32.91\%$) and Macro F1 ($0.9400$)

## Running Locally
```bash
npm install
npm run dev
```
The dashboard runs at `http://localhost:3000`.

For detailed documentation, refer to [`doc/11_FRONTEND_SPEC.md`](file:///c:/Users/HP/Downloads/SMS2Finance/doc/11_FRONTEND_SPEC.md).
