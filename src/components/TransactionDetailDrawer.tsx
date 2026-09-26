import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { RISK_SIGNAL_RULES, computeRiskScore, formatINR, getRiskBandColor } from '../utils/riskEngine';
import { 
  X, 
  GitFork, 
  UserCheck, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Sliders, 
  Check, 
  FileText,
  AlertTriangle,
  Bot
} from 'lucide-react';

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  accountsMap: Map<string, Account>;
  isOpen: boolean;
  onClose: () => void;
  onViewInGraph: (tx: Transaction) => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
  onOpenProfileMismatch: (tx: Transaction) => void;
  onOpenFileComplaint: (tx: Transaction) => void;
  onUpdateSignals: (txnId: string, updatedSignalCodes: string[]) => void;
  onConsultCopilot?: (tx: Transaction) => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  accountsMap,
  isOpen,
  onClose,
  onViewInGraph,
  onOpenCustomerVerification,
  onOpenProfileMismatch,
  onOpenFileComplaint,
  onUpdateSignals,
  onConsultCopilot,
}) => {
  if (!isOpen || !transaction) return null;

  const sender = accountsMap.get(transaction.sender_id);
  const receiver = accountsMap.get(transaction.receiver_id);
  const colors = getRiskBandColor(transaction.risk_band);

  const activeCodes = new Set(transaction.signals);

  const handleToggleSignal = (code: string) => {
    let nextCodes: string[];
    if (activeCodes.has(code)) {
      nextCodes = transaction.signals.filter((c) => c !== code);
    } else {
      nextCodes = [...transaction.signals, code];
    }
    onUpdateSignals(transaction.transaction_id, nextCodes);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400">TRANSACTION DOSSIER</span>
              <span className="font-mono text-white text-sm font-bold">{transaction.transaction_id}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive telemetry, counterparty profiles & risk breakdown
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Amount & Risk Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Transaction Value</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                ₹{formatINR(transaction.amount)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
                  {transaction.type}
                </span>
                <span>• {transaction.display_time}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Calculated Risk Score</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`text-xl font-bold font-mono px-2.5 py-1 rounded-lg border ${colors.badge}`}>
                  {transaction.risk_score} / 100
                </span>
              </div>
              <span className={`text-xs font-semibold ${colors.text} block mt-1`}>
                {transaction.risk_band} Risk Band
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                onClose();
                onViewInGraph(transaction);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <GitFork className="w-4 h-4 text-cyan-400" />
              <span>Trace in Graph</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCustomerVerification(transaction);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Verify via SMS</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenProfileMismatch(transaction);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>KYC Deviation</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFileComplaint(transaction);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>1930 Cyber Cell</span>
            </button>
          </div>

          {/* AI Forensic Assessment Launcher */}
          {onConsultCopilot && (
            <button
              onClick={() => {
                onClose();
                onConsultCopilot(transaction);
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-900/40 via-cyan-950/40 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 text-xs font-semibold flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">Consult Gemini AML Copilot</div>
                  <div className="text-[10px] text-slate-400">Ask multi-turn AI about this transaction's risk & chain</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Launch Copilot &rarr;
              </span>
            </button>
          )}

          {/* Counterparties Flow */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Inter-Account Flow
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Originator */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Sender (Origin)</span>
                <div className="font-bold text-white mt-0.5">{sender?.name || transaction.sender_id}</div>
                <div className="text-[11px] text-slate-400">{sender?.account_type} • {sender?.city}</div>
                <div className="text-[10px] text-cyan-400 mt-1 font-mono">UPI: {sender?.upi_handle}</div>
              </div>

              <div className="flex items-center justify-center text-slate-500">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Beneficiary */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Beneficiary (Destination)</span>
                <div className="font-bold text-white mt-0.5">{receiver?.name || transaction.receiver_id}</div>
                <div className="text-[11px] text-slate-400">{receiver?.account_type} • {receiver?.city}</div>
                <div className="text-[10px] text-cyan-400 mt-1 font-mono">
                  Limit: ₹{formatINR(receiver?.usual_monthly_credit_range[1] || 0)}/mo
                </div>
              </div>
            </div>
          </div>

          {/* Additive Signal Scoring Rules (Interactive Switcher) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Additive Risk Scoring Matrix
                </span>
                <span className="text-[11px] text-slate-400">
                  Toggle signals to observe real-time score adjustment (0-100 spectrum)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ADDITIVE WEIGHTS
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {Object.values(RISK_SIGNAL_RULES).map((rule) => {
                const isActive = activeCodes.has(rule.code);

                return (
                  <div
                    key={rule.code}
                    onClick={() => handleToggleSignal(rule.code)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between text-xs ${
                      isActive
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 pr-2">
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'border-slate-700 bg-slate-950'
                      }`}>
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{rule.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">[{rule.category}]</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                      </div>
                    </div>

                    <span className={`font-mono font-bold text-xs shrink-0 px-2 py-0.5 rounded ${
                      isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      +{rule.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rapid Multi-Hop Insight */}
          {transaction.rapid_forward_minutes !== undefined && (
            <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/40 text-xs text-orange-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Rapid Layering Anomaly (Forwarded in {transaction.rapid_forward_minutes} minutes)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The funds were received and immediately forwarded to another account within minutes. In classic mule syndicates, accounts maintain minimal idle balances to evade post-complaint bank freezes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Audit Log ID: AUD-TXN-{transaction.transaction_id.slice(-4)}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
