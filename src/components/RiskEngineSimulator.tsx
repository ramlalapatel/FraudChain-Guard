import React, { useState } from 'react';
import { RISK_SIGNAL_RULES, getRiskBand, getRiskBandColor, formatINR } from '../utils/riskEngine';
import { Sliders, ShieldCheck, AlertTriangle, Flame, AlertCircle, Check, Sparkles, Code } from 'lucide-react';
import { RiskBand } from '../types';

export const RiskEngineSimulator: React.FC = () => {
  const [activeSignals, setActiveSignals] = useState<string[]>([
    'SENDER_SUSPICIOUS',
    'UNUSUAL_AMOUNT',
    'RAPID_MULTIHOP',
  ]);

  const [hypotheticalAmount, setHypotheticalAmount] = useState<number>(480000);
  const [accountType, setAccountType] = useState<string>('Student');

  // Compute total score
  const totalScore = Math.min(
    100,
    activeSignals.reduce((acc, code) => acc + (RISK_SIGNAL_RULES[code]?.points || 0), 0)
  );

  const riskBand: RiskBand = getRiskBand(totalScore);
  const colors = getRiskBandColor(riskBand);

  const toggleSignal = (code: string) => {
    setActiveSignals((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const applyPreset = (preset: 'clean' | 'mule' | 'denial' | 'critical') => {
    if (preset === 'clean') {
      setActiveSignals([]);
      setHypotheticalAmount(15000);
      setAccountType('Salaried');
    } else if (preset === 'mule') {
      setActiveSignals(['UNUSUAL_AMOUNT', 'RAPID_MULTIHOP', 'LINKED_TO_SUSPICIOUS']);
      setHypotheticalAmount(480000);
      setAccountType('Student');
    } else if (preset === 'denial') {
      setActiveSignals(['CUSTOMER_DENIES', 'UNUSUAL_AMOUNT', 'NEW_SENDER']);
      setHypotheticalAmount(95000);
      setAccountType('Homemaker');
    } else if (preset === 'critical') {
      setActiveSignals([
        'SENDER_SUSPICIOUS',
        'LINKED_TO_SUSPICIOUS',
        'CUSTOMER_DENIES',
        'UNUSUAL_AMOUNT',
        'RAPID_MULTIHOP',
      ]);
      setHypotheticalAmount(500000);
      setAccountType('Student');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Additive Risk Scoring Engine Matrix</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              CONFIGURABLE TESTBENCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and calibrate the additive weight mathematical model specified for transaction risk evaluation
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            onClick={() => applyPreset('clean')}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            Clean STP
          </button>
          <button
            onClick={() => applyPreset('mule')}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            Mule Layer
          </button>
          <button
            onClick={() => applyPreset('denial')}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            Customer Denial
          </button>
          <button
            onClick={() => applyPreset('critical')}
            className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-semibold cursor-pointer"
          >
            Critical Strike
          </button>
        </div>
      </div>

      {/* Main Grid: Gauge on Left, Signals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Score Gauge & Risk Band (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center">
          <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
            Real-Time Evaluated Score
          </span>

          {/* Big Score Display */}
          <div className="my-4 relative">
            <div className={`w-36 h-36 rounded-full border-4 ${colors.border} flex flex-col items-center justify-center bg-slate-900/90 shadow-2xl transition-all duration-300`}>
              <span className={`text-4xl font-extrabold font-mono ${colors.text}`}>
                {totalScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100 PTS</span>
            </div>
          </div>

          {/* Risk Band Badge */}
          <div className="space-y-2 w-full">
            <div className={`py-1.5 px-4 rounded-xl border text-sm font-bold tracking-wide ${colors.badge}`}>
              {riskBand.toUpperCase()} RISK BAND
            </div>

            <p className="text-xs text-slate-400 px-2">
              {riskBand === 'Critical' && '⚡ Automatic transactional hold initiated; file dispatched to AML nodal desk.'}
              {riskBand === 'High' && 'Automated evidence request dispatched to customer via SMS and banking app.'}
              {riskBand === 'Medium' && 'Behavioral anomaly flagged; monitored on secondary velocity stream.'}
              {riskBand === 'Low' && 'Safe Straight-Through-Processing (STP) clearance granted.'}
            </p>
          </div>

          {/* Scoring Bands Visual Spectrum */}
          <div className="w-full mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-400">0-25 Low</span>
              <span className="text-yellow-400">26-50 Medium</span>
              <span className="text-amber-400">51-75 High</span>
              <span className="text-rose-400">76-100 Critical</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden">
              <div style={{ width: '25%' }} className="bg-emerald-500" />
              <div style={{ width: '25%' }} className="bg-yellow-400" />
              <div style={{ width: '25%' }} className="bg-amber-500" />
              <div style={{ width: '25%' }} className="bg-rose-500" />
            </div>
          </div>
        </div>

        {/* Right: The Additive Weights Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Additive Signal Toggles (Click to Add / Remove Signal)
            </span>
            <span className="text-xs text-cyan-400 font-mono">
              Active Signals: {activeSignals.length} of 7
            </span>
          </div>

          <div className="space-y-2">
            {Object.values(RISK_SIGNAL_RULES).map((rule) => {
              const isChecked = activeSignals.includes(rule.code);

              return (
                <div
                  key={rule.code}
                  onClick={() => toggleSignal(rule.code)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isChecked
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition ${
                      isChecked
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rule.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                    </div>
                  </div>

                  <span className={`font-mono font-bold text-xs shrink-0 px-2.5 py-1 rounded-lg ${
                    isChecked ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    +{rule.points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Code Inspect View */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Deterministic Mathematical Weight Specification</span>
        </div>
        <pre className="text-[11px] text-cyan-300/90 overflow-x-auto p-3 rounded-lg bg-slate-900/80 border border-slate-800">
{`// Additive Risk Signal Rules configured in Bank Risk Engine:
const ADDITIVE_SIGNALS = {
  SENDER_SUSPICIOUS:     +30, // Prior complaint / marked under investigation
  LINKED_TO_SUSPICIOUS:  +30, // 2-hop graph distance to confirmed fraud node
  CUSTOMER_DENIES:       +40, // Account holder explicitly reports unrecognized credit
  UNUSUAL_AMOUNT:        +20, // Profile mismatch >150% above monthly KYC limit
  RAPID_MULTIHOP:        +20, // Inward credit forwarded in <15 minutes
  NEW_SENDER:            +10, // First time transaction pair
  UNUSUAL_TIME:          +5,  // Initiated in 01:00 AM - 05:00 AM window
};

Score = Math.min(100, Math.max(0, sum(ActiveSignals)));`}
        </pre>
      </div>
    </div>
  );
};
