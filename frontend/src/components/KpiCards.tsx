import React from 'react';
import { ArrowDownRight, ArrowUpRight, Wallet, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FinancialSummary } from '../types';

interface KpiCardsProps {
  summary: FinancialSummary;
  activeBalance?: number;
  activeAccountLabel?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  summary,
  activeBalance,
  activeAccountLabel,
}) => {
  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amt);
  };

  const hasActiveBalance = activeBalance !== undefined && activeBalance !== null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        hasActiveBalance ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
      } gap-4 mb-6`}
    >
      {/* 0. Optional: Live Account Balance (When viewing specific account) */}
      {hasActiveBalance && (
        <div className="glass-panel p-5 rounded-2xl glass-card-hover border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Live Bank Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-white mb-1">
            {formatCurrency(activeBalance)}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{activeAccountLabel ? activeAccountLabel : 'Current Available Balance'}</span>
          </div>
        </div>
      )}

      {/* 1. Total Spending (Debits) */}
      <div className="glass-panel p-5 rounded-2xl glass-card-hover border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Outflow (Debits)
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white mb-1">
          {formatCurrency(summary.totalSpent)}
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Verified Debits</span>
        </div>
      </div>

      {/* 2. Total Inflow (Credits) */}
      <div className="glass-panel p-5 rounded-2xl glass-card-hover border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Inflow (Credits)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white mb-1">
          {formatCurrency(summary.totalReceived)}
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Income &amp; Inward UPI</span>
        </div>
      </div>

      {/* 3. Net Liquidity */}
      <div className="glass-panel p-5 rounded-2xl glass-card-hover border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Cash Flow
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-2xl font-bold tracking-tight mb-1 ${
            summary.netFlow >= 0 ? 'text-white' : 'text-rose-400'
          }`}
        >
          {formatCurrency(summary.netFlow)}
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>Net Surplus Margin</span>
        </div>
      </div>

      {/* 4. Structured Transactions & Ingestion */}
      <div className="glass-panel p-5 rounded-2xl glass-card-hover border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account Activity
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white mb-1">
          {summary.totalTransactions} <span className="text-sm font-normal text-slate-400">Txns</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Extracted Transactions</span>
        </div>
      </div>
    </div>
  );
};
