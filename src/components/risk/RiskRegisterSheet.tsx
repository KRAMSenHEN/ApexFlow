import React from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, ArrowUpRight, MessageSquare } from 'lucide-react';
import { ThreadItem } from '../../types';

interface RiskRegisterSheetProps {
  risks: ThreadItem[];
  onSelectRisk: (risk: ThreadItem) => void;
}

export const RiskRegisterSheet: React.FC<RiskRegisterSheetProps> = ({
  risks,
  onSelectRisk,
}) => {
  const getLevelBadge = (level?: string, score?: number) => {
    switch (level) {
      case 'severe':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">Severe ({score})</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">High ({score})</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold">Moderate ({score})</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">Low ({score})</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-xs text-white">RMMM Risk Information Sheet / Executive Register</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {risks.length} recorded risks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Risk ID</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-4 min-w-[200px]">Risk Title & Scope</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">I</th>
              <th className="py-3 px-3 text-center">Exposure</th>
              <th className="py-3 px-4 min-w-[220px]">Mitigation (Proactive)</th>
              <th className="py-3 px-4 min-w-[200px]">Monitoring (Triggers)</th>
              <th className="py-3 px-4 min-w-[220px]">Management (Contingency)</th>
              <th className="py-3 px-3">Owner</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {risks.map((r) => {
              const d = r.riskData;
              const isSolved = r.status === 'solved';

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRisk(r)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  {/* Risk ID */}
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400 whitespace-nowrap">
                    {d?.riskId || 'RSK-???'}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-semibold">
                      {d?.category || 'General'}
                    </span>
                  </td>

                  {/* Title */}
                  {/* Title */}
                  <td className="py-3 px-4 min-w-[180px] max-w-xs">
                    <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 break-words">
                      {r.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 break-words">
                      {r.initialContent}
                    </div>
                  </td>

                  {/* P & I */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                    {d?.probability || 1}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                    {d?.impact || 1}
                  </td>

                  {/* Exposure Level */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getLevelBadge(d?.riskLevel, d?.exposureScore)}
                  </td>

                  {/* Mitigation */}
                  <td className="py-3 px-4 min-w-[180px] max-w-xs">
                    <div className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 break-words">
                      {d?.mitigationPlan || 'None specified'}
                    </div>
                  </td>

                  {/* Monitoring */}
                  <td className="py-3 px-4 min-w-[180px] max-w-xs">
                    <div className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 break-words">
                      {d?.monitoringStrategy || 'None specified'}
                    </div>
                  </td>

                  {/* Management */}
                  <td className="py-3 px-4 min-w-[180px] max-w-xs">
                    <div className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 break-words">
                      {d?.managementPlan || 'None specified'}
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-300">
                    {d?.ownerName || r.authorName}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {isSolved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mitigated</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        <AlertCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {risks.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No risks matching current filters.
          </div>
        )}
      </div>
    </div>
  );
};
