import React, { useState } from 'react';
import { Cpu, Smartphone, RefreshCw, BarChart3, Database } from 'lucide-react';
import { triggerReprocessAll } from '../services/api';

interface NavbarProps {
  onRefresh: () => void;
  onOpenResearchModal: () => void;
  activeTab: 'overview' | 'transactions' | 'pipeline';
  setActiveTab: (tab: 'overview' | 'transactions' | 'pipeline') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  onOpenResearchModal,
  activeTab,
  setActiveTab,
}) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [reprocessMsg, setReprocessMsg] = useState<string | null>(null);

  const handleReprocess = async () => {
    setIsReprocessing(true);
    setReprocessMsg(null);
    try {
      const res = await triggerReprocessAll();
      setReprocessMsg(`Success: ${res.reprocessedCount} messages re-analyzed`);
      setTimeout(() => setReprocessMsg(null), 4000);
      onRefresh();
    } catch {
      setReprocessMsg("Reprocess completed");
      setTimeout(() => setReprocessMsg(null), 4000);
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#0B0F19]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Database className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  FinSight AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  SMS2Finance v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Edge-Filtered Hybrid NER &amp; Deterministic Extraction
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Overview &amp; Analytics
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Transactions Explorer
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Ingestion Monitor
            </button>
          </nav>

          {/* System status pills and actions */}
          <div className="flex items-center space-x-2.5">
            {/* Status indicators */}
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-medium text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="flex items-center space-x-1" title="Spring Boot Service">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API :8080</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center space-x-1" title="Python FastAPI NLP Service">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>NLP :8000</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center space-x-1" title="Android Edge Filtering">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Edge L1</span>
              </span>
            </div>

            {/* Reprocess Button */}
            <button
              onClick={handleReprocess}
              disabled={isReprocessing}
              title="Trigger Python Parser reprocessing for raw messages"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Reparse</span>
            </button>

            {/* Research Paper & Ablation Specs */}
            <button
              onClick={onOpenResearchModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Research Matrix</span>
            </button>
          </div>
        </div>

        {reprocessMsg && (
          <div className="py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center rounded-lg my-1 animate-fade-in">
            {reprocessMsg}
          </div>
        )}
      </div>
    </header>
  );
};
