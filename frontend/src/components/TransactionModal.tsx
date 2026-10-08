import React from 'react';
import { Transaction } from '../types';
import { X, CheckCircle2, Cpu, Sparkles, Building2, CreditCard } from 'lucide-react';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isDebit = transaction.transactionType === 'DEBIT';

  const formatCurrency = (amt?: number) => {
    if (amt === undefined || amt === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-panel w-full max-w-lg rounded-3xl border-slate-700/80 shadow-2xl p-6 relative overflow-hidden bg-[#111827]/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDebit ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Summary */}
        <div className="flex items-center space-x-3 mb-6 mt-1">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
              isDebit
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isDebit ? '↓' : '↑'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {transaction.merchant || 'Financial Transaction'}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isDebit
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {transaction.transactionType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Extracted via Algorithm 2 Conflict-Aware Reconciliation
            </p>
          </div>
        </div>

        {/* Amount Badge */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 mb-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Reconciled Value
            </span>
            <div className={`text-3xl font-extrabold mt-0.5 ${isDebit ? 'text-white' : 'text-emerald-400'}`}>
              {formatCurrency(transaction.amount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Confidence
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-lg font-bold text-indigo-300">
                {Math.round((transaction.extractionConfidence || 0.9) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Entity Provenance Table */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Structured Extraction Provenance</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Bank */}
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Bank Name (Rule)</span>
              <div className="font-medium text-slate-200 mt-0.5 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{transaction.bankName || '—'}</span>
              </div>
            </div>

            {/* Account */}
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Source Account (Regex)</span>
              <div className="font-medium text-slate-200 mt-0.5 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{transaction.accountLastFour ? `Ending in ${transaction.accountLastFour}` : '—'}</span>
              </div>
            </div>

            {/* RRN */}
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">RRN / UTR (Algorithm 3)</span>
              <div className="font-mono text-slate-200 mt-0.5 truncate text-[11px]">
                {transaction.rrn || 'None'}
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Post-Txn Balance (Regex)</span>
              <div className="font-medium text-slate-200 mt-0.5">
                {transaction.bankBalance ? formatCurrency(transaction.bankBalance) : '—'}
              </div>
            </div>

            {/* UPI ID */}
            {transaction.upiId && (
              <div className="col-span-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Virtual Payment Address (Regex)</span>
                <div className="font-mono text-slate-200 mt-0.5 text-xs">
                  {transaction.upiId}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Parser Version: {transaction.parserVersion || '1.0.0-hybrid'}</span>
          </div>
          <span>Raw SMS #{transaction.rawSmsId || transaction.id}</span>
        </div>
      </div>
    </div>
  );
};
