import React from 'react';
import { AccountSummary } from '../types';
import { Building2, CreditCard, CheckCircle2, Layers, ArrowDownRight, ArrowUpRight, ShieldCheck, Wifi } from 'lucide-react';

interface AccountSelectorProps {
  accounts: AccountSummary[];
  selectedAccount: string; // 'ALL' or specific account last 4 (e.g., '1541', '4821')
  onSelectAccount: (acc: string) => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
}) => {
  const formatINR = (amt?: number) => {
    if (amt === undefined || amt === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amt);
  };

  // Color schemes for realistic bank debit/credit cards
  const getCardTheme = (accLastFour: string, index: number) => {
    if (accLastFour === '1541') {
      return {
        bg: 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/60 border-emerald-500/40 shadow-emerald-950/40',
        activeGlow: 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 border-emerald-400',
        chipColor: 'bg-amber-400/80',
        accentText: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      };
    } else if (accLastFour === '4821') {
      return {
        bg: 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-blue-950/60 border-indigo-500/40 shadow-indigo-950/40',
        activeGlow: 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20 border-indigo-400',
        chipColor: 'bg-amber-400/80',
        accentText: 'text-indigo-400',
        badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      };
    } else {
      const themes = [
        {
          bg: 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border-purple-500/40 shadow-purple-950/40',
          activeGlow: 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/20 border-purple-400',
          chipColor: 'bg-amber-400/80',
          accentText: 'text-purple-400',
          badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        },
        {
          bg: 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40 shadow-amber-950/40',
          activeGlow: 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 border-amber-400',
          chipColor: 'bg-amber-400/80',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        },
      ];
      return themes[index % themes.length];
    }
  };

  const selectedAccountObj = accounts.find((a) => a.accountLastFour === selectedAccount);

  return (
    <div className="mb-8">
      {/* Section Header with Mode Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Bank Account Dashboards
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Isolated Per Account Last 4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an account card below to view its isolated balance, cash flow, and transaction history
          </p>
        </div>

        {/* View Switcher: Individual Account vs Merged Overview */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectAccount('ALL')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              selectedAccount === 'ALL'
                ? 'bg-slate-800 text-white border-slate-600 shadow-sm ring-1 ring-slate-400/40'
                : 'text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Accounts (Consolidated)</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc, idx) => {
          const isSelected = selectedAccount === acc.accountLastFour;
          const theme = getCardTheme(acc.accountLastFour, idx);

          return (
            <div
              key={acc.accountLastFour}
              onClick={() => onSelectAccount(acc.accountLastFour)}
              className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border backdrop-blur-md overflow-hidden ${
                theme.bg
              } ${isSelected ? theme.activeGlow : 'hover:border-slate-700/80 hover:scale-[1.01]'}`}
            >
              {/* Subtle metallic shine overlay */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header: Bank & Card Chip */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200">
                    <Building2 className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {acc.bankName}
                    </h3>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                      <span>Verified SMS Source</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Wifi className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                  {/* EMV Chip graphic */}
                  <div className="w-7 h-5 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-4 h-2.5 border border-amber-600/60 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Card Number: Account Last 4 Display */}
              <div className="mb-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                  Account Number
                </div>
                <div className="font-mono text-base font-bold text-white tracking-widest flex items-center space-x-2">
                  <span className="text-slate-400">•••• •••• ••••</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-emerald-300">
                    {acc.accountLastFour}
                  </span>
                </div>
              </div>

              {/* Live Bank Balance */}
              <div className="mb-4 pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Available Balance
                  </span>
                  <div className="text-xl font-extrabold text-white tracking-tight">
                    {formatINR(acc.latestBalance)}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Bal
                </span>
              </div>

              {/* Card Bottom Strip: Outflow / Inflow / Count */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Debits</span>
                  <span className="font-bold text-rose-400 flex items-center">
                    <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
                    {formatINR(acc.totalSpent)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Credits</span>
                  <span className="font-bold text-emerald-400 flex items-center">
                    <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
                    {formatINR(acc.totalReceived)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Activity</span>
                  <span className="font-bold text-white">
                    {acc.transactionCount} Txns
                  </span>
                </div>
              </div>

              {/* Active Selection Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACTIVE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Account Status Banner */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-medium">
            Currently Viewing:{' '}
            <strong className="text-white">
              {selectedAccount === 'ALL'
                ? 'All Accounts Combined (Consolidated)'
                : `${selectedAccountObj?.bankName || 'Bank Account'} (A/c •••• ${selectedAccount})`}
            </strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {selectedAccount === 'ALL' ? (
            <span>Showing merged overview across all accounts</span>
          ) : (
            <span>
              All charts, totals, and transactions below are strictly isolated to A/c ••••{' '}
              {selectedAccount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
