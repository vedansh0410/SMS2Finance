import React from 'react';
import { RawSms } from '../types';
import { Smartphone, CheckCircle, Clock, ShieldX, Ban, AlertCircle } from 'lucide-react';

interface SmsIngestionFeedProps {
  smsList: RawSms[];
}

export const SmsIngestionFeed: React.FC<SmsIngestionFeedProps> = ({ smsList }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PARSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            <span>Extracted</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending NLP</span>
          </span>
        );
      case 'DUPLICATE_DROPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Ban className="w-3 h-3" />
            <span>Dedup Dropped</span>
          </span>
        );
      case 'SKIPPED_NON_TXN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-400 border border-slate-700">
            <ShieldX className="w-3 h-3" />
            <span>Non-Transaction</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const formatDate = (epochMillis?: number) => {
    if (!epochMillis) return '—';
    return new Date(epochMillis).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Android Telephony Ingestion Feed
            </h3>
            <p className="text-xs text-slate-400">
              Raw SMS ingested sequentially via Retrofit (Oldest to Newest, L1 Filtered)
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 text-xs text-slate-400">
          Total Ingested Messages: <span className="font-bold text-white">{smsList.length}</span>
        </div>
      </div>

      <div className="space-y-3">
        {smsList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No raw messages in ingestion queue. Sync via Android or send a POST to /api/sms.
          </div>
        ) : (
          smsList.map((sms) => (
            <div
              key={sms.id}
              className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-300 px-2 py-0.5 bg-indigo-950/60 rounded border border-indigo-800/40">
                    {sms.sender}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(sms.timestamp)}
                  </span>
                </div>
                {getStatusBadge(sms.processingStatus)}
              </div>

              <p className="text-xs text-slate-300 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 break-words">
                {sms.message}
              </p>

              {sms.processingError && (
                <div className="text-[11px] text-rose-400 font-mono">
                  Error: {sms.processingError}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
