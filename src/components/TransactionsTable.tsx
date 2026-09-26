import React, { useState } from 'react';
import { 
  Account, 
  RiskBand, 
  Transaction 
} from '../types';
import { formatINR, getRiskBandColor } from '../utils/riskEngine';
import { 
  Search, 
  SlidersHorizontal, 
  ExternalLink, 
  GitFork, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  UserCheck,
  FileCheck
} from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  accountsMap: Map<string, Account>;
  selectedBand: RiskBand | 'ALL';
  onSelectTransaction: (tx: Transaction) => void;
  onViewInGraph: (tx: Transaction) => void;
  onOpenProfileMismatch: (tx: Transaction) => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
  onOpenFileComplaint: (tx: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  accountsMap,
  selectedBand,
  onSelectTransaction,
  onViewInGraph,
  onOpenProfileMismatch,
  onOpenCustomerVerification,
  onOpenFileComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'FLAGGED' | 'CHAIN_ONLY' | 'VERIFICATION_PENDING'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'UPI' | 'IMPS' | 'NEFT'>('ALL');

  // Filter pipeline
  const filtered = transactions.filter((t) => {
    // 1. Risk band from parent
    if (selectedBand !== 'ALL' && t.risk_band !== selectedBand) return false;

    // 2. Filter mode
    if (filterMode === 'FLAGGED' && t.label !== 'suspicious') return false;
    if (filterMode === 'CHAIN_ONLY' && !t.is_fraud_chain_part) return false;
    if (filterMode === 'VERIFICATION_PENDING' && t.investigation_status !== 'Customer Verification Pending') return false;

    // 3. Type filter
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sender = accountsMap.get(t.sender_id);
      const receiver = accountsMap.get(t.receiver_id);
      const matchId = t.transaction_id.toLowerCase().includes(q);
      const matchSender = sender?.name.toLowerCase().includes(q) || t.sender_id.toLowerCase().includes(q);
      const matchReceiver = receiver?.name.toLowerCase().includes(q) || t.receiver_id.toLowerCase().includes(q);
      const matchAmount = t.amount.toString().includes(q);
      return matchId || matchSender || matchReceiver || matchAmount;
    }

    return true;
  });

  const getAccountBadge = (acc?: Account) => {
    if (!acc) return null;
    const typeColors: Record<string, string> = {
      Student: 'bg-purple-950/80 text-purple-300 border-purple-800',
      Homemaker: 'bg-pink-950/80 text-pink-300 border-pink-800',
      Salaried: 'bg-blue-950/80 text-blue-300 border-blue-800',
      'Small Business': 'bg-teal-950/80 text-teal-300 border-teal-800',
      Corporate: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    };

    return (
      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${typeColors[acc.account_type] || 'bg-slate-800 text-slate-300'}`}>
        {acc.account_type}
      </span>
    );
  };

  const getStatusBadge = (status: Transaction['investigation_status']) => {
    switch (status) {
      case 'Escalated to LEA':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">Escalated to LEA</span>;
      case 'Under Investigation':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">Under Investigation</span>;
      case 'Customer Verification Pending':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Proof Pending</span>;
      case 'Customer Confirmed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">Proof Given</span>;
      case 'Cleared':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Cleared (STP)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">Pending Review</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by TXN-ID, Account Name, or Amount..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                filterMode === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterMode('FLAGGED')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                filterMode === 'FLAGGED' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Suspicious ({transactions.filter((t) => t.label === 'suspicious').length})
            </button>
            <button
              onClick={() => setFilterMode('CHAIN_ONLY')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                filterMode === 'CHAIN_ONLY' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Mule Chain ({transactions.filter((t) => t.is_fraud_chain_part).length})
            </button>
            <button
              onClick={() => setFilterMode('VERIFICATION_PENDING')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                filterMode === 'VERIFICATION_PENDING' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              Proof Pending ({transactions.filter((t) => t.investigation_status === 'Customer Verification Pending').length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Rails</option>
              <option value="UPI">UPI Only</option>
              <option value="IMPS">IMPS Only</option>
              <option value="NEFT">NEFT Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">TXN ID & Method</th>
              <th className="py-3 px-4">Sender &rarr; Receiver</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
              <th className="py-3 px-4">Risk & Signals</th>
              <th className="py-3 px-4">Case Status</th>
              <th className="py-3 px-4 text-right">Interactive Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const sender = accountsMap.get(tx.sender_id);
                const receiver = accountsMap.get(tx.receiver_id);
                const colors = getRiskBandColor(tx.risk_band);

                return (
                  <tr 
                    key={tx.transaction_id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectTransaction(tx)}
                  >
                    {/* TXN ID & Method */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {tx.transaction_id}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{tx.display_time}</span>
                        {tx.rapid_forward_minutes !== undefined && (
                          <span className="text-amber-400 font-medium text-[10px] flex items-center gap-0.5 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60">
                            ⚡ {tx.rapid_forward_minutes}m forward
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sender -> Receiver */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-slate-200">{sender?.name || tx.sender_id}</span>
                          {getAccountBadge(sender)}
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-slate-200">{receiver?.name || tx.receiver_id}</span>
                          {getAccountBadge(receiver)}
                        </div>
                      </div>

                      {/* Profile Mismatch Tag */}
                      {tx.profile_deviation?.is_mismatch && (
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProfileMismatch(tx);
                            }}
                            className="text-[10px] font-medium text-rose-300 bg-rose-950/70 border border-rose-800/80 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-rose-900 transition"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>Profile Mismatch ({tx.profile_deviation.multiplier}x limit)</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-sm font-bold text-white">
                        ₹{formatINR(tx.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.is_fraud_chain_part ? (
                          <span className="text-cyan-400 font-mono text-[10px]">
                            Chain: {tx.chain_role || 'Layer'}
                          </span>
                        ) : (
                          'Isolated Flow'
                        )}
                      </div>
                    </td>

                    {/* Risk & Signals */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${colors.badge}`}>
                          {tx.risk_score}/100
                        </span>
                        <span className={`text-[11px] font-semibold ${colors.text}`}>
                          {tx.risk_band}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="text-slate-400 font-mono">
                          {tx.detected_signals.length} {tx.detected_signals.length === 1 ? 'signal' : 'signals'}
                        </span>
                        {tx.detected_signals.some((s) => s.code === 'CUSTOMER_DENIES') && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded border border-rose-500/40">
                            Denial (+40)
                          </span>
                        )}
                        {tx.complaint && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded border border-rose-500/40">
                            1930 Cyber
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Investigation Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(tx.investigation_status)}
                      {tx.notes.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-cyan-400" />
                          <span>{tx.notes.length} analyst note{tx.notes.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </td>

                    {/* Interactive Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Trace in Graph */}
                        <button
                          onClick={() => onViewInGraph(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition cursor-pointer"
                          title="View position in Fraud Chain Graph"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                        </button>

                        {/* Customer Verification */}
                        <button
                          onClick={() => onOpenCustomerVerification(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Simulate Customer SMS/App Evidence Request"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* File Complaint */}
                        <button
                          onClick={() => onOpenFileComplaint(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
                          title="File 1930 Cyber Cell Complaint"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>

                        {/* Details Drawer */}
                        <button
                          onClick={() => onSelectTransaction(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Open Transaction Dossier & Signal Matrix"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          Showing <span className="text-white font-mono">{filtered.length}</span> of{' '}
          <span className="text-white font-mono">{transactions.length}</span> records
        </div>
        <div className="flex items-center gap-2">
          <span>Click any row to open the complete signal scoring breakdown</span>
        </div>
      </div>
    </div>
  );
};
