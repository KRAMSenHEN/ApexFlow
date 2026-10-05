import React from 'react';
import { ThreadItem } from '../../types';

interface RiskMatrixHeatmapProps {
  risks: ThreadItem[];
  selectedProbability: number | null;
  selectedImpact: number | null;
  onSelectCoordinate: (prob: number | null, impact: number | null) => void;
}

const PROBABILITY_LABELS = [
  { val: 5, label: '5 - Critical (>70%)' },
  { val: 4, label: '4 - High (50-70%)' },
  { val: 3, label: '3 - Med (30-50%)' },
  { val: 2, label: '2 - Low (10-30%)' },
  { val: 1, label: '1 - V.Low (<10%)' },
];

const IMPACT_LABELS = [
  { val: 1, label: '1 - Negligible' },
  { val: 2, label: '2 - Marginal' },
  { val: 3, label: '3 - Significant' },
  { val: 4, label: '4 - Critical' },
  { val: 5, label: '5 - Catastrophic' },
];

export const RiskMatrixHeatmap: React.FC<RiskMatrixHeatmapProps> = ({
  risks,
  selectedProbability,
  selectedImpact,
  onSelectCoordinate,
}) => {
  // Count risks at each (P, I) coordinate
  const countMap: Record<string, number> = {};
  risks.forEach((r) => {
    if (r.riskData) {
      const p = r.riskData.probability || 1;
      const i = r.riskData.impact || 1;
      const key = `${p}-${i}`;
      countMap[key] = (countMap[key] || 0) + 1;
    }
  });

  const getCellColor = (p: number, i: number, isSelected: boolean) => {
    const score = p * i;
    if (isSelected) {
      return 'ring-2 ring-white border-white bg-indigo-600 text-white font-black scale-105 z-10';
    }
    if (score >= 17) {
      return 'bg-rose-950/80 hover:bg-rose-900 border-rose-800/80 text-rose-300';
    }
    if (score >= 10) {
      return 'bg-amber-950/80 hover:bg-amber-900 border-amber-800/80 text-amber-300';
    }
    if (score >= 5) {
      return 'bg-yellow-950/50 hover:bg-yellow-900/70 border-yellow-800/60 text-yellow-300';
    }
    return 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-800/60 text-emerald-300';
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl select-none">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>5×5 RMMM Risk Matrix Heatmap</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
              Interactive
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Click any cell to filter risks by Probability × Impact score
          </p>
        </div>

        {(selectedProbability !== null || selectedImpact !== null) && (
          <button
            onClick={() => onSelectCoordinate(null, null)}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            Clear matrix filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-center text-xs">
        {/* Top Header Corner */}
        <div className="text-[10px] font-bold text-slate-500 p-1 text-right">
          P \ I
        </div>
        {IMPACT_LABELS.map((imp) => (
          <div key={imp.val} className="text-[9px] font-semibold text-slate-400 p-1 truncate" title={imp.label}>
            {imp.label.split(' - ')[1]}
          </div>
        ))}

        {/* Matrix Rows (Probability descending 5 down to 1) */}
        {PROBABILITY_LABELS.map((prob) => (
          <React.Fragment key={prob.val}>
            <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end pr-2 whitespace-nowrap">
              P{prob.val}
            </div>
            {IMPACT_LABELS.map((imp) => {
              const count = countMap[`${prob.val}-${imp.val}`] || 0;
              const isSelected = selectedProbability === prob.val && selectedImpact === imp.val;
              const score = prob.val * imp.val;

              return (
                <button
                  key={`${prob.val}-${imp.val}`}
                  onClick={() => {
                    if (isSelected) {
                      onSelectCoordinate(null, null);
                    } else {
                      onSelectCoordinate(prob.val, imp.val);
                    }
                  }}
                  className={`h-9 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${getCellColor(
                    prob.val,
                    imp.val,
                    isSelected
                  )}`}
                  title={`Probability: ${prob.label}, Impact: ${imp.label}, Exposure: ${score}, Active Risks: ${count}`}
                >
                  <span className="font-extrabold text-xs">{count > 0 ? count : '·'}</span>
                  <span className="text-[8px] opacity-60 font-mono">{score}</span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-semibold text-slate-500">Risk Severity Exposure:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Low (1-4)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Moderate (5-9)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>High (10-16)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Severe (17-25)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
