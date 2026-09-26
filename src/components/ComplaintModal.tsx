import React, { useState } from 'react';
import { Account, Transaction, CyberComplaint } from '../types';
import { formatINR } from '../utils/riskEngine';
import { X, ShieldAlert, Building2, User, FileText, CheckCircle2 } from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accountsMap: Map<string, Account>;
  preselectedTxnId?: string;
  onSubmitComplaint: (txnId: string, complaint: CyberComplaint, analystNote: string) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accountsMap,
  preselectedTxnId,
  onSubmitComplaint,
}) => {
  const [selectedTxnId, setSelectedTxnId] = useState<string>(
    preselectedTxnId || (transactions[0]?.transaction_id || '')
  );

  const [complainantName, setComplainantName] = useState('Ramesh Kulkarni');
  const [complainantPhone, setComplainantPhone] = useState('+91 98201 44810');
  const [portalRef, setPortalRef] = useState('NCRP-1930-MH-2026-');
  const [category, setCategory] = useState('UPI Impersonation / Phishing Call');
  const [cyberDivision, setCyberDivision] = useState('Cyber Police Station Pune Crime Branch');
  const [description, setDescription] = useState(
    'Victim coerced into approving payment after caller claimed electricity power connection will be cut tonight.'
  );

  if (!isOpen) return null;

  const currentTx = transactions.find((t) => t.transaction_id === selectedTxnId);
  const receiver = currentTx ? accountsMap.get(currentTx.receiver_id) : null;
  const isCorporateOrCurrent = receiver?.account_type === 'Corporate' || receiver?.account_type === 'Small Business';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTx) return;

    const fullComplaint: CyberComplaint = {
      complaint_id: `CMP-${Date.now().toString().slice(-6)}`,
      portal_ref: portalRef + Math.floor(1000 + Math.random() * 9000),
      reported_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      complainant_name: complainantName,
      complainant_phone: complainantPhone,
      category,
      cyber_cell_division: cyberDivision,
      analyst_notes: description,
    };

    const noteText = `CYBER COMPLAINT LOGGED [Ref: ${fullComplaint.portal_ref}]: ${category}. System elevated risk and initiated evidence request (${isCorporateOrCurrent ? 'HIGH CORPORATE SCRUTINY MANDATE' : 'Standard AML Flow'}).`;

    onSubmitComplaint(currentTx.transaction_id, fullComplaint, noteText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Trigger 2: File Cyber Complaint</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HELPLINE 1930 / NCRP INGEST
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log a cyber fraud report against a transaction to initiate automated scrutiny & evidence requests
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Target Transaction Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Target Transaction to Flag
            </label>
            <select
              value={selectedTxnId}
              onChange={(e) => setSelectedTxnId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            >
              {transactions.map((tx) => {
                const rec = accountsMap.get(tx.receiver_id);
                return (
                  <option key={tx.transaction_id} value={tx.transaction_id}>
                    {tx.transaction_id} | ₹{formatINR(tx.amount)} | {tx.sender_id} &rarr; {rec?.name} ({rec?.account_type}) | {tx.type}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Scrutiny Level Banner */}
          {currentTx && receiver && (
            <div className={`p-3.5 rounded-xl border ${
              isCorporateOrCurrent
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorporateOrCurrent ? (
                    <Building2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <User className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-xs font-bold text-white">
                    Beneficiary Entity: {receiver.name} ({receiver.account_type})
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isCorporateOrCurrent
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {isCorporateOrCurrent ? 'HIGH SCRUTINY MANDATE' : 'STANDARD AML FLOW'}
                </span>
              </div>
              <p className="text-[11px] mt-1.5 text-slate-400">
                {isCorporateOrCurrent
                  ? '⚡ CORPORATE NOTICE: Even 1 complaint on a corporate account requires mandatory compliance evidence (GST invoice, board KYC) within 24 hours under RBI commercial fraud circulars.'
                  : 'Standard retail account. Complaint elevates transaction risk score (+30) and triggers customer proof SMS query.'}
              </p>
            </div>
          )}

          {/* Complainant Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Complainant / Victim Name</label>
              <input
                type="text"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Complainant Phone / Mobile</label>
              <input
                type="text"
                value={complainantPhone}
                onChange={(e) => setComplainantPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Crime Category & Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fraud Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="UPI Impersonation / Phishing Call">UPI Impersonation / Phishing Call</option>
                <option value="Fake Utility Bill / Electricity Disconnect APK">Fake Utility Bill / Electricity APK</option>
                <option value="Telegram Part-time Work Commission Scam">Telegram Part-time Work Commission</option>
                <option value="Business Email Compromise (BEC) / Spoofed Vendor">Business Email Compromise (BEC)</option>
                <option value="Instant Loan Extortion / Blackmail">Instant Loan Extortion / Blackmail</option>
                <option value="Stock Trading / Crypto Investment Fraud">Stock Trading / Crypto Fraud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Jurisdiction / Police Station</label>
              <input
                type="text"
                value={cyberDivision}
                onChange={(e) => setCyberDivision(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Analyst Summary */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Complaint Incident Narrative & Key Facts
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              placeholder="Detail how the fraud occurred, spoofed numbers, or APK downloaded..."
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Log Cyber Complaint & Trigger Evidence Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
