import React, { useState } from 'react';
import { Account, Transaction, CaseNote } from '../types';
import { formatINR, getRiskBandColor } from '../utils/riskEngine';
import { 
  FileSearch, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  Send, 
  Clock, 
  Printer, 
  ExternalLink,
  GitFork,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface InvestigationPanelProps {
  transactions: Transaction[];
  accountsMap: Map<string, Account>;
  onSelectTransaction: (tx: Transaction) => void;
  onViewInGraph: (tx: Transaction) => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
  onUpdateStatus: (txnId: string, status: Transaction['investigation_status']) => void;
  onAddCaseNote: (txnId: string, noteText: string) => void;
  onExportReport: (tx: Transaction) => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  transactions,
  accountsMap,
  onSelectTransaction,
  onViewInGraph,
  onOpenCustomerVerification,
  onUpdateStatus,
  onAddCaseNote,
  onExportReport,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER_INVESTIGATION' | 'VERIFICATION_PENDING' | 'ESCALATED' | 'CLEARED'>('ALL');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Flagged or investigated cases
  const caseList = transactions.filter((t) => {
    const isFlagged = t.label === 'suspicious' || t.risk_score >= 40 || t.notes.length > 0 || t.complaint;
    if (!isFlagged) return false;

    if (statusFilter === 'UNDER_INVESTIGATION') return t.investigation_status === 'Under Investigation';
    if (statusFilter === 'VERIFICATION_PENDING') return t.investigation_status === 'Customer Verification Pending';
    if (statusFilter === 'ESCALATED') return t.investigation_status === 'Escalated to LEA';
    if (statusFilter === 'CLEARED') return t.investigation_status === 'Cleared' || t.investigation_status === 'Customer Confirmed';

    return true;
  });

  const activeCase = transactions.find((t) => t.transaction_id === selectedCaseId) || caseList[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeCase) return;
    onAddCaseNote(activeCase.transaction_id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              <span>AML Case Management & Investigation Queue</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              {caseList.length} Active Dossiers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyst workflow for reviewing flagged mule transactions, customer proofs, and cyber crime complaints
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Flagged ({caseList.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNDER_INVESTIGATION')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
              statusFilter === 'UNDER_INVESTIGATION' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Under Investigation
          </button>
          <button
            onClick={() => setStatusFilter('VERIFICATION_PENDING')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
              statusFilter === 'VERIFICATION_PENDING' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Proof Pending
          </button>
          <button
            onClick={() => setStatusFilter('ESCALATED')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
              statusFilter === 'ESCALATED' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            Escalated to LEA
          </button>
          <button
            onClick={() => setStatusFilter('CLEARED')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
              statusFilter === 'CLEARED' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Cleared / Confirmed
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* Left List: Cases Queue (5 Cols) */}
        <div className="lg:col-span-5 overflow-y-auto max-h-[640px] p-3 space-y-2 bg-slate-950/40">
          {caseList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No cases match the selected status filter.
            </div>
          ) : (
            caseList.map((tx) => {
              const isSelected = activeCase?.transaction_id === tx.transaction_id;
              const sender = accountsMap.get(tx.sender_id);
              const receiver = accountsMap.get(tx.receiver_id);
              const colors = getRiskBandColor(tx.risk_band);

              return (
                <div
                  key={tx.transaction_id}
                  onClick={() => setSelectedCaseId(tx.transaction_id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{tx.transaction_id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {tx.type}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${colors.badge}`}>
                      {tx.risk_score} / 100 • {tx.risk_band}
                    </span>
                  </div>

                  <div className="mt-2 text-xs flex items-center justify-between text-slate-300">
                    <div className="truncate max-w-[200px]">
                      <span className="text-slate-400">{sender?.name}</span> &rarr;{' '}
                      <strong className="text-white">{receiver?.name}</strong>
                    </div>
                    <span className="font-mono font-bold text-white shrink-0">₹{formatINR(tx.amount)}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {tx.display_time}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      tx.investigation_status === 'Escalated to LEA'
                        ? 'bg-rose-500/20 text-rose-300'
                        : tx.investigation_status === 'Under Investigation'
                        ? 'bg-amber-500/20 text-amber-300'
                        : tx.investigation_status === 'Customer Verification Pending'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {tx.investigation_status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane: Active Case Dossier (7 Cols) */}
        {activeCase ? (
          <div className="lg:col-span-7 p-5 flex flex-col justify-between overflow-y-auto max-h-[640px] space-y-4 bg-slate-900/60">
            <div className="space-y-4">
              
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400">CASE DOSSIER</span>
                    <span className="text-sm font-bold text-white font-mono">{activeCase.transaction_id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    ₹{formatINR(activeCase.amount)}{' '}
                    <span className="text-xs font-mono font-normal text-slate-400">({activeCase.type})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onExportReport(activeCase)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                    title="Generate formatted cyber crime report"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Export Incident File</span>
                  </button>

                  <button
                    onClick={() => onViewInGraph(activeCase)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    title="Inspect transaction path in Graph"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Chain</span>
                  </button>
                </div>
              </div>

              {/* Counterparty Dossier Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Sender */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Originating Sender</span>
                  <div className="font-bold text-white mt-1">
                    {accountsMap.get(activeCase.sender_id)?.name || activeCase.sender_id}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {accountsMap.get(activeCase.sender_id)?.account_type} • Status: {accountsMap.get(activeCase.sender_id)?.risk_status}
                  </div>
                </div>

                {/* Receiver */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Receiving Beneficiary</span>
                  <div className="font-bold text-white mt-1">
                    {accountsMap.get(activeCase.receiver_id)?.name || activeCase.receiver_id}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {accountsMap.get(activeCase.receiver_id)?.account_type} • {accountsMap.get(activeCase.receiver_id)?.kyc_occupation}
                  </div>
                </div>
              </div>

              {/* Signals breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Triggered Risk Signals</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${getRiskBandColor(activeCase.risk_band).badge}`}>
                    {activeCase.risk_score}/100 • {activeCase.risk_band}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {activeCase.detected_signals.map((sig) => (
                    <div key={sig.code} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{sig.name}</span>
                        <span className="font-mono text-amber-400 font-bold">+{sig.points} pts</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sig.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cyber Complaint Details if exists */}
              {activeCase.complaint && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Cyber Crime Complaint Filed ({activeCase.complaint.portal_ref})
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{activeCase.complaint.reported_at}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <strong>Complainant:</strong> {activeCase.complaint.complainant_name} ({activeCase.complaint.complainant_phone})
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Details:</strong> {activeCase.complaint.analyst_notes}
                  </p>
                </div>
              )}

              {/* Customer Evidence Status */}
              {activeCase.evidence && (
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      Customer Evidence Submitted
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{activeCase.evidence.submittedAt}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <strong>Declared Purpose:</strong> {activeCase.evidence.purposeCategory} &mdash; "{activeCase.evidence.description}"
                  </p>
                  {activeCase.evidence.documentName && (
                    <p className="text-cyan-400 text-[11px] font-mono">
                      Attached Doc: {activeCase.evidence.documentName}
                    </p>
                  )}
                </div>
              )}

              {/* Analyst Case Notes Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Case Activity & Analyst Notes ({activeCase.notes.length})</span>
                </span>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {activeCase.notes.length === 0 ? (
                    <div className="p-3 rounded bg-slate-950 text-slate-500 text-xs text-center">
                      No case notes recorded yet. Add initial assessment below.
                    </div>
                  ) : (
                    activeCase.notes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="font-semibold text-cyan-300">{note.author} ({note.role})</span>
                          <span>{note.timestamp}</span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter analyst observation or investigation finding..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </form>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Change Status:</span>
                  <button
                    onClick={() => onUpdateStatus(activeCase.transaction_id, 'Cleared')}
                    className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition cursor-pointer"
                  >
                    Mark Cleared
                  </button>
                  <button
                    onClick={() => onUpdateStatus(activeCase.transaction_id, 'Under Investigation')}
                    className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-medium transition cursor-pointer"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => onUpdateStatus(activeCase.transaction_id, 'Escalated to LEA')}
                    className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-medium transition cursor-pointer"
                  >
                    Escalate to LEA
                  </button>
                </div>

                <button
                  onClick={() => onOpenCustomerVerification(activeCase)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Request Proof via SMS</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-8 text-center text-slate-500 flex flex-col items-center justify-center">
            <FileSearch className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Select a Case Dossier</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click any flagged transaction from the queue on the left to review signals, update case disposition, or add investigation notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
