import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SpendingTrend, BankStat, MerchantStat } from '../types';
import { TrendingUp, PieChart as PieIcon, ShoppingBag } from 'lucide-react';
import { cleanMerchantName } from '../utils/merchant';

interface AnalyticsChartsProps {
  trends: SpendingTrend[];
  banks: BankStat[];
  merchants: MerchantStat[];
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ trends, banks, merchants }) => {
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Cashflow Trends (Area Chart) */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Cash Flow Trends</h3>
              <p className="text-[11px] text-slate-400">Debit Outflows vs Inward Credits Over Time</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Debit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Credit</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [formatINR(val), '']}
              />
              <Area type="monotone" dataKey="debit" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorDebit)" name="Debit" />
              <Area type="monotone" dataKey="credit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCredit)" name="Credit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bank-Wise Distribution (Donut Chart) */}
      <div className="glass-panel p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bank Distribution</h3>
              <p className="text-[11px] text-slate-400">Transaction Volume Across Institutions</p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={banks}
                  dataKey="count"
                  nameKey="bankName"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                >
                  {banks.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: number, name: string) => [`${val} Transactions`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank legend list */}
        <div className="space-y-1.5 mt-2 border-t border-slate-800/80 pt-3">
          {banks.map((b, idx) => (
            <div key={b.bankName} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300 truncate max-w-[120px]">{b.bankName}</span>
              </div>
              <span className="font-medium text-slate-400">{formatINR(b.totalAmount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Merchants Leaderboard */}
      <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Top Merchants by Expenditure</h3>
              <p className="text-[11px] text-slate-400">Contextual Entities Extracted by NER &amp; Rules</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {merchants.slice(0, 4).map((m, idx) => (
            <div key={m.merchant} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 truncate">{cleanMerchantName(m.merchant, 'Unknown')}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                  #{idx + 1}
                </span>
              </div>
              <div className="text-base font-bold text-white mb-1">
                {formatINR(m.totalAmount)}
              </div>
              <div className="text-[11px] text-slate-400">
                {m.count} {m.count === 1 ? 'transaction' : 'transactions'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
