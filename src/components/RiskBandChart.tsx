import React from 'react';
import { RiskBand, Transaction } from '../types';
import { formatINR } from '../utils/riskEngine';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

interface RiskBandChartProps {
  transactions: Transaction[];
  selectedBand: RiskBand | 'ALL';
  onSelectBand: (band: RiskBand | 'ALL') => void;
}

export const RiskBandChart: React.FC<RiskBandChartProps> = ({
  transactions,
  selectedBand,
  onSelectBand,
}) => {
  const counts: Record<RiskBand, { count: number; volume: number }> = {
    Low: { count: 0, volume: 0 },
    Medium: { count: 0, volume: 0 },
    High: { count: 0, volume: 0 },
    Critical: { count: 0, volume: 0 },
  };

  transactions.forEach((t) => {
    counts[t.risk_band].count += 1;
    counts[t.risk_band].volume += t.amount;
  });

  const totalCount = Math.max(1, transactions.length);

  const bands: {
    band: RiskBand;
    label: string;
    range: string;
    color: string;
    border: string;
    bg: string;
    barColor: string;
    icon: React.ReactNode;
    actionNote: string;
  }[] = [
    {
      band: 'Critical',
      label: 'Critical Risk',
      range: '76 - 100',
      color: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20 hover:bg-rose-900/30',
      barColor: 'bg-rose-500',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      actionNote: 'Auto-hold & urgent AML review',
    },
    {
      band: 'High',
      label: 'High Risk',
      range: '51 - 75',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20 hover:bg-amber-900/30',
      barColor: 'bg-amber-500',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      actionNote: 'Customer evidence request dispatched',
    },
    {
      band: 'Medium',
      label: 'Medium Risk',
      range: '26 - 50',
      color: 'text-yellow-400',
      border: 'border-yellow-500/40',
      bg: 'bg-yellow-950/20 hover:bg-yellow-900/30',
      barColor: 'bg-yellow-400',
      icon: <AlertCircle className="w-4 h-4 text-yellow-400" />,
      actionNote: 'Velocity alert / Profile deviation check',
    },
    {
      band: 'Low',
      label: 'Low / Normal',
      range: '0 - 25',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20 hover:bg-emerald-900/30',
      barColor: 'bg-emerald-500',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      actionNote: 'Frictionless STP processing',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Risk-Band Telemetry & Breakdown</span>
            <span className="text-xs text-slate-400 font-normal">
              (Additive Signal Scoring Engine)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Click any band below to filter the live transaction stream
          </p>
        </div>

        {selectedBand !== 'ALL' && (
          <button
            onClick={() => onSelectBand('ALL')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 self-start cursor-pointer"
          >
            Clear Filter (Show All Bands)
          </button>
        )}
      </div>

      {/* Segmented Distribution Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="h-4 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {bands.map((b) => {
            const pct = (counts[b.band].count / totalCount) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={b.band}
                style={{ width: `${pct}%` }}
                className={`${b.barColor} transition-all duration-300 rounded-sm relative group cursor-pointer`}
                onClick={() => onSelectBand(selectedBand === b.band ? 'ALL' : b.band)}
                title={`${b.label}: ${counts[b.band].count} transactions (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>0 (Safe STP)</span>
          <span>Score Spectrum (0 - 100)</span>
          <span>100 (Critical Fraud)</span>
        </div>
      </div>

      {/* 4 Cards for Bands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bands.map((b) => {
          const item = counts[b.band];
          const pct = Math.round((item.count / totalCount) * 100);
          const isSelected = selectedBand === b.band;

          return (
            <div
              key={b.band}
              onClick={() => onSelectBand(isSelected ? 'ALL' : b.band)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? `${b.border} bg-slate-800/90 shadow-md ring-1 ring-cyan-500/50`
                  : `border-slate-800/80 ${b.bg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {b.icon}
                  <span className={`text-xs font-semibold ${b.color}`}>{b.label}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                  {b.range}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="text-xl font-bold font-mono text-white">
                  {item.count}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">
                    ({pct}%)
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  ₹{formatINR(item.volume)}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate">{b.actionNote}</span>
                {isSelected && (
                  <span className="text-cyan-400 font-semibold text-[10px] shrink-0 ml-1">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
