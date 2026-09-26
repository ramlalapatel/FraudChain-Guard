import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { evaluateProfileMismatch, formatINR } from '../utils/riskEngine';
import { ShieldAlert, Zap, Building2, User, Sliders, ArrowRight, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

interface TriggersHubProps {
  accounts: Account[];
  transactions: Transaction[];
  onOpenProfileMismatch: (tx: Transaction) => void;
  onOpenFileComplaint: (tx: Transaction) => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
}

export const TriggersHub: React.FC<TriggersHubProps> = ({
  accounts,
  transactions,
  onOpenProfileMismatch,
  onOpenFileComplaint,
  onOpenCustomerVerification,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[2]?.id || 'ACC-MUL-01');
  const [simulatedCredit, setSimulatedCredit] = useState<number>(500000);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const mismatchCalc = evaluateProfileMismatch(simulatedCredit, selectedAccount);

  // Filter transactions that fired Trigger 1
  const trigger1Txns = transactions.filter((t) => t.profile_deviation?.is_mismatch);
  // Filter transactions that fired Trigger 2 (Complaints)
  const trigger2Txns = transactions.filter((t) => t.complaint !== undefined);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Detection Triggers & Regulatory Scrutiny Engine</h2>
            <p className="text-xs text-slate-400">
              Interactive testbench for Trigger 1 (Profile Mismatch) and Trigger 2 (Cyber Complaint Evidence Request)
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Trigger 1 and Trigger 2 in full view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TRIGGER 1 CARD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-white">Trigger 1: Profile Mismatch Detector</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                KYC BASELINE ENGINE
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              When an inward credit arrives, the engine compares the transaction sum against the account's declared monthly credit limit based on KYC occupation. If incoming sum is far outside profile (e.g. Student receiving ₹5 Lakh), it triggers an automated evidence alert.
            </p>

            {/* Interactive Sandbox */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Test Live Profile Mismatch Simulator:</span>
                <span className="text-cyan-400 font-mono text-[11px]">{selectedAccount?.account_type}</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Account:</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_type} - {acc.kyc_occupation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Incoming Simulated Credit:</span>
                  <span className="font-mono text-white font-bold">₹{formatINR(simulatedCredit)}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={2000000}
                  step={10000}
                  value={simulatedCredit}
                  onChange={(e) => setSimulatedCredit(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Evaluation Output */}
              <div className={`p-3 rounded-lg border text-xs ${
                mismatchCalc.isMismatch
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>{mismatchCalc.isMismatch ? '⚡ MISMATCH TRIGGER FIRED (+20 PTS)' : 'PASSED (NORMAL PROFILE)'}</span>
                  <span className="font-mono">{mismatchCalc.multiplier}x Limit</span>
                </div>
                <p className="text-[11px] leading-relaxed">{mismatchCalc.reason}</p>
              </div>
            </div>

            {/* Currently Flagged in Live Stream */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Currently Triggered in Live Stream ({trigger1Txns.length})
              </span>
              <div className="space-y-1.5">
                {trigger1Txns.map((tx) => (
                  <div
                    key={tx.transaction_id}
                    onClick={() => onOpenProfileMismatch(tx)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-cyan-400 font-bold">{tx.transaction_id}</span>
                      <span className="text-slate-400 ml-2">₹{formatINR(tx.amount)}</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-semibold underline">
                      Inspect {tx.profile_deviation?.multiplier}x Deviation &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TRIGGER 2 CARD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-white">Trigger 2: Complaint-Triggered Scrutiny</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1930 / CYBER PORTAL
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              When a cyber victim reports fraud via 1930 or the National Cyber Crime Reporting Portal (NCRP), the system links the transaction, checks the account type, and dispatches an immediate evidence request.
            </p>

            {/* Corporate Scrutiny Highlight */}
            <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Strict Corporate / Current Account Scrutiny Mandate</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Under commercial banking compliance directives, <strong>even a single cyber complaint on a Corporate or Current account</strong> triggers an automatic freeze warning and requires GST tax invoice submission and board KYC confirmation.
              </p>
            </div>

            {/* Existing Complaint Cases */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Active Cyber Complaints in Stream ({trigger2Txns.length})
              </span>
              <div className="space-y-2">
                {trigger2Txns.map((tx) => (
                  <div
                    key={tx.transaction_id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-rose-400 font-bold">{tx.transaction_id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {tx.complaint?.portal_ref}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      <strong>Category:</strong> {tx.complaint?.category}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Complainant: {tx.complaint?.complainant_name} ({tx.complaint?.cyber_cell_division})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File complaint action */}
            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => onOpenFileComplaint(transactions[0])}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/40 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Open Cyber Complaint Filing Form</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
