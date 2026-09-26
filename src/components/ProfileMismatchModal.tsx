import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { evaluateProfileMismatch, formatINR } from '../utils/riskEngine';
import { X, ShieldAlert, ArrowRight, UserCheck, CheckCircle2, Sliders } from 'lucide-react';

interface ProfileMismatchModalProps {
  transaction: Transaction | null;
  accountsMap: Map<string, Account>;
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
}

export const ProfileMismatchModal: React.FC<ProfileMismatchModalProps> = ({
  transaction,
  accountsMap,
  isOpen,
  onClose,
  onOpenCustomerVerification,
}) => {
  const [testAmount, setTestAmount] = useState<number | null>(null);

  if (!isOpen || !transaction) return null;

  const receiver = accountsMap.get(transaction.receiver_id);
  const sender = accountsMap.get(transaction.sender_id);
  const currentAmount = testAmount !== null ? testAmount : transaction.amount;
  const mismatchResult = evaluateProfileMismatch(currentAmount, receiver);

  const [minLimit, maxLimit] = receiver?.usual_monthly_credit_range || [0, 0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Trigger 1: Profile Mismatch Detector</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RULE #PM-204
                </span>
              </div>
              <p className="text-xs text-slate-400">
                KYC Occupation Credit Range vs Incoming Credit Evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Target Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Beneficiary (Receiving Account)
              </span>
              <div className="font-bold text-white text-sm">{receiver?.name || transaction.receiver_id}</div>
              <div className="text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-[10px]">
                  {receiver?.account_type}
                </span>
                <span className="text-slate-400">• Age: {receiver?.account_age}</span>
              </div>
              <div className="text-xs text-slate-300 pt-1">
                <strong>KYC Occupation:</strong> {receiver?.kyc_occupation}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Incoming Transaction Details
              </span>
              <div className="font-mono text-white text-sm font-bold">{transaction.transaction_id}</div>
              <div className="text-xs text-slate-300">
                <strong>Rail:</strong> {transaction.type} via {transaction.display_time}
              </div>
              <div className="text-xs text-slate-300">
                <strong>Sender:</strong> {sender?.name} ({sender?.account_type})
              </div>
            </div>
          </div>

          {/* Visual Profile Comparison Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Credit Baseline vs Transaction Spike</span>
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                mismatchResult.isMismatch
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {mismatchResult.isMismatch ? 'CRITICAL PROFILE DEVIATION' : 'WITHIN EXPECTED PROFILE'}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1.5">
              <div className="relative pt-6">
                {/* Max baseline marker */}
                <div 
                  className="absolute top-0 text-[10px] font-mono text-slate-400 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: '20%' }}
                >
                  <span className="text-cyan-400 font-bold">₹{formatINR(maxLimit)}</span>
                  <span>(KYC Max)</span>
                </div>

                {/* Progress bar */}
                <div className="h-6 w-full rounded-lg bg-slate-800 flex overflow-hidden p-0.5 relative">
                  {/* Normal KYC band */}
                  <div 
                    style={{ width: '20%' }} 
                    className="bg-emerald-600/70 h-full rounded-l border-r border-slate-950 flex items-center justify-center text-[10px] text-white font-mono"
                  >
                    Normal Band
                  </div>

                  {/* Deviation Spike */}
                  {mismatchResult.isMismatch ? (
                    <div 
                      style={{ width: '80%' }} 
                      className="bg-gradient-to-r from-amber-500 via-rose-600 to-rose-700 h-full rounded-r flex items-center justify-end pr-2 text-[11px] text-white font-mono font-bold animate-pulse"
                    >
                      Incoming: ₹{formatINR(currentAmount)} ({mismatchResult.multiplier}x)
                    </div>
                  ) : (
                    <div 
                      style={{ width: `${Math.min(20, (currentAmount / Math.max(1, maxLimit)) * 20)}%` }} 
                      className="bg-cyan-500 h-full rounded-r"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Min: ₹{formatINR(minLimit)}</span>
                <span className="text-cyan-400">KYC Monthly Limit: ₹{formatINR(maxLimit)}</span>
                <span className="text-rose-400 font-bold">Transaction: ₹{formatINR(currentAmount)}</span>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200">
              <strong className="text-white block mb-1">Algorithmic Detection Explanation:</strong>
              {mismatchResult.reason}
            </div>
          </div>

          {/* Triggered Autonomous Actions */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Autonomous Safeguards Initiated by Trigger 1
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-start gap-2 bg-slate-900/80 p-2 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Score Penalty:</strong>
                  <p className="text-slate-400 mt-0.5">Applied +20 points for UNUSUAL_AMOUNT signal.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-900/80 p-2 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Customer Evidence Request:</strong>
                  <p className="text-slate-400 mt-0.5">Automated SMS/In-App query generated to verify commercial basis.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Simulator Slider */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Different Credit Amounts on this Account</span>
              </span>
              <button
                onClick={() => setTestAmount(transaction.amount)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset to Original (₹{formatINR(transaction.amount)})
              </button>
            </div>
            <input
              type="range"
              min={minLimit}
              max={maxLimit * 25}
              step={5000}
              value={currentAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Tested: ₹{formatINR(currentAmount)}</span>
              <span className={mismatchResult.isMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {mismatchResult.multiplier}x Limit ({mismatchResult.isMismatch ? 'TRIGGERS MISMATCH' : 'PASSED'})
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Close Inspector
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCustomerVerification(transaction);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-blue-900/40"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Launch Customer Verification Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
