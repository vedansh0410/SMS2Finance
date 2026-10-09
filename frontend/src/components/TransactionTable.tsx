import React, { useState } from 'react';
import { Transaction, AccountSummary } from '../types';
import { Search, Filter, ArrowDownRight, ArrowUpRight, ChevronRight, Building2, CreditCard } from 'lucide-react';
import { cleanMerchantName } from '../utils/merchant';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAccount?: string;
  setSelectedAccount?: (acc: string) => void;
  accounts?: AccountSummary[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTransaction,
  selectedBank,
  setSelectedBank,
  selectedType,
  setSelectedType,
  searchQuery,
  setSearchQuery,
  selectedAccount = 'ALL',
  setSelectedAccount,
  accounts = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amt);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedItems = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden mb-8">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-900/40">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant, RRN, account..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Account Filter (if accounts provided) */}
          {accounts.length > 0 && setSelectedAccount && (
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-800/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="ALL">All Accounts (Combined)</option>
                {accounts.map((acc) => (
                  <option key={acc.accountLastFour} value={acc.accountLastFour}>
                    A/c •••• {acc.accountLastFour} ({acc.bankName})
                  </option>
                ))}
              </select>
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Transaction Type Filter */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80 text-xs">
            {['ALL', 'DEBIT', 'CREDIT'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t === 'DEBIT' ? 'Debits' : 'Credits'}
              </button>
            ))}
          </div>

          {/* Bank Select */}
          <div className="relative">
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Banks</option>
              <option value="Indian Bank">Indian Bank</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Entity / Merchant</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Bank &amp; Account</th>
              <th className="py-3 px-4">RRN / UTR</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Extraction Confidence</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No transactions match your current search and filters.
                </td>
              </tr>
            ) : (
              paginatedItems.map((txn) => {
                const isDebit = txn.transactionType === 'DEBIT';
                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                  >
                    {/* Merchant / Entity */}
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isDebit
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isDebit ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate max-w-[150px]">{cleanMerchantName(txn.merchant, 'General Transaction')}</span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          isDebit
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {txn.transactionType}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-sm">
                      <span className={isDebit ? 'text-white' : 'text-emerald-400'}>
                        {isDebit ? '-' : '+'}
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>

                    {/* Bank & Account */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[120px]">{txn.bankName || 'Bank'}</span>
                      </div>
                      {txn.accountLastFour && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          A/c •••• {txn.accountLastFour}
                        </div>
                      )}
                    </td>

                    {/* RRN */}
                    <td className="py-3.5 px-4">
                      {txn.rrn ? (
                        <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60">
                          {txn.rrn}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(txn.paymentDate)}
                    </td>

                    {/* Confidence Meter */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${Math.round((txn.extractionConfidence || 0.9) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-300">
                          {Math.round((txn.extractionConfidence || 0.9) * 100)}%
                        </span>
                      </div>
                    </td>

                    {/* Arrow action */}
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition transform group-hover:translate-x-1 inline-block" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} records
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-300 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 text-slate-300 hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
