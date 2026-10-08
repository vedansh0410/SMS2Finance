import React from 'react';
import { X, Award, CheckCircle2, TrendingDown, Layers, FileText, Zap } from 'lucide-react';

interface ResearchBenchmarkModalProps {
  onClose: () => void;
}

export const ResearchBenchmarkModal: React.FC<ResearchBenchmarkModalProps> = ({ onClose }) => {
  const ablationStages = [
    {
      id: 'Ablation-A',
      name: 'Raw Baseline',
      components: 'Full Inbox Sync + Spring Boot + Regex-only Extraction',
      bandwidthReduction: '0.0%',
      macroF1: '0.940',
      badge: 'Baseline',
      color: 'text-slate-400 bg-slate-800'
    },
    {
      id: 'Ablation-B',
      name: 'Edge-Filtered',
      components: 'Algorithm 1 (L1 Filter) + Full Inbox Sync + Regex-only',
      bandwidthReduction: '32.9%',
      macroF1: '0.940',
      badge: '+32.9% BW Efficiency',
      color: 'text-blue-400 bg-blue-900/30'
    },
    {
      id: 'Ablation-C',
      name: 'Filtered + Incremental',
      components: 'Algorithm 1 + Incremental Sync (lastSync checkpoint) + Regex-only',
      bandwidthReduction: '32.9%',
      macroF1: '0.940',
      badge: 'Zero Redundancy',
      color: 'text-indigo-400 bg-indigo-900/30'
    },
    {
      id: 'Ablation-D',
      name: 'Filtered + Standalone NER',
      components: 'Algorithm 1 + lastSync + Standalone NER (No Regex)',
      bandwidthReduction: '32.9%',
      macroF1: '0.540',
      badge: 'ML-Only (Rigid entities fail)',
      color: 'text-amber-400 bg-amber-900/30'
    },
    {
      id: 'Ablation-E',
      name: 'Proposed Hybrid Pipeline',
      components: 'Algorithm 1 (L1) + lastSync + Hybrid NER & Rules + Tiered Dedup',
      bandwidthReduction: '32.9%',
      macroF1: '0.940',
      badge: 'Optimal Architecture',
      color: 'text-emerald-400 bg-emerald-900/30'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-4xl rounded-3xl border-slate-700/80 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto bg-[#111827]/98"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Research &amp; Benchmark Evaluation
            </h2>
            <p className="text-xs text-slate-400">
              Conforming to 18_DATASET_BENCHMARK_SPEC.md &amp; 19_EXPERIMENTAL_SETUP_ABLATION.md
            </p>
          </div>
        </div>

        {/* Key Empirical Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bandwidth Reduction</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">32.91%</div>
            <p className="text-[11px] text-slate-500 mt-1">Irrelevant SMS dropped at edge</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Extraction Macro F1</span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-400">94.0%</div>
            <p className="text-[11px] text-slate-500 mt-1">Exact span matching across 6 banks</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>False Merge Rate</span>
            </div>
            <div className="text-2xl font-extrabold text-blue-400">0.00%</div>
            <p className="text-[11px] text-slate-500 mt-1">Tiered deduplication (Algorithm 3)</p>
          </div>
        </div>

        {/* Ablation Study Matrix */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>5-Stage Empirical Ablation Matrix</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Configuration</th>
                  <th className="py-2.5 px-3">Active Pipeline Components</th>
                  <th className="py-2.5 px-3 text-center">Bandwidth Saved</th>
                  <th className="py-2.5 px-3 text-center">Macro F1</th>
                  <th className="py-2.5 px-3 text-right">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ablationStages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-slate-850/40">
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {stage.id}
                      <div className="text-[10px] font-normal text-slate-400">{stage.name}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {stage.components}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {stage.bandwidthReduction}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-400">
                      {stage.macroF1}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${stage.color}`}>
                        {stage.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benchmark Corpus Summary */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Benchmark Dataset Corpus (2,500 Messages)</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Stratified across 6 financial institutions (SBI, HDFC, ICICI, Axis, PNB, BOB):
            Debit UPI (35%), Debit Card/ATM (15%), Credit (20%), OTP Distractors (15%), Promotional Distractors (15%).
            Sanitized under Differential Anonymization protocol (masked accounts, synthetic UPI IDs, systematic RRN checksum substitution).
          </p>
        </div>
      </div>
    </div>
  );
};
