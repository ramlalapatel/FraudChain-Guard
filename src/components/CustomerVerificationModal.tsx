import React, { useState } from 'react';
import { Account, EvidenceSubmission, Transaction } from '../types';
import { formatINR } from '../utils/riskEngine';
import { 
  X, 
  Smartphone, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  Building,
  User
} from 'lucide-react';

interface CustomerVerificationModalProps {
  transaction: Transaction | null;
  accountsMap: Map<string, Account>;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (txnId: string, evidence: EvidenceSubmission) => void;
  onDenyPayment: (txnId: string, denialReason: string) => void;
}

export const CustomerVerificationModal: React.FC<CustomerVerificationModalProps> = ({
  transaction,
  accountsMap,
  isOpen,
  onClose,
  onSubmitProof,
  onDenyPayment,
}) => {
  const [purposeCategory, setPurposeCategory] = useState<EvidenceSubmission['purposeCategory']>('Business Sale of Goods');
  const [description, setDescription] = useState('Payment received for freelance web development and marketing tasks.');
  const [selectedDoc, setSelectedDoc] = useState<string>('Tax_Invoice_INV-2026-88.pdf');
  const [activeStep, setActiveStep] = useState<'form' | 'success_confirmed' | 'success_denied'>('form');

  if (!isOpen || !transaction) return null;

  const receiver = accountsMap.get(transaction.receiver_id);
  const sender = accountsMap.get(transaction.sender_id);

  const handleConfirmProof = () => {
    const evidence: EvidenceSubmission = {
      purposeCategory,
      description,
      documentName: selectedDoc,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'submitted',
    };
    onSubmitProof(transaction.transaction_id, evidence);
    setActiveStep('success_confirmed');
  };

  const handleDeny = () => {
    const reason = 'Customer responded via mobile portal: "I did not authorize or recognize this sender. I was told to transfer it to someone else."';
    onDenyPayment(transaction.transaction_id, reason);
    setActiveStep('success_denied');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Customer Verification Simulator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SMS / IN-APP PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates the end-user KYC evidence request received on the account holder's smartphone
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[80vh]">
          {activeStep === 'form' && (
            <div className="space-y-4">
              {/* Simulated Mobile SMS Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono mb-2">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    BANK FRAUD PREVENTION DESK
                  </span>
                  <span>{transaction.display_time}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-200">
                  <p>
                    Dear <strong className="text-white">{receiver?.name || transaction.receiver_id}</strong> (A/c **4810),
                  </p>
                  <p className="text-slate-300">
                    A credit of <strong className="text-cyan-300 font-mono">₹{formatINR(transaction.amount)}</strong> was received into your {receiver?.account_type} account from <strong className="text-white">{sender?.name || transaction.sender_id}</strong> via {transaction.type}.
                  </p>
                  <p className="text-amber-300 font-medium text-[11px] bg-amber-950/40 p-2 rounded border border-amber-800/50">
                    ⚠️ To comply with banking regulations & safeguard your account against unauthorized mule liability, please verify the commercial basis or report if unrecognized.
                  </p>
                </div>
              </div>

              {/* Purpose Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  1. Purpose of Received Amount (Select Category)
                </label>
                <select
                  value={purposeCategory}
                  onChange={(e) => setPurposeCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Salary">Salary / Professional Compensation</option>
                  <option value="Business Sale of Goods">Business Sale of Goods / Retail Order</option>
                  <option value="Service Fee">Professional Service Fee / Consultancy</option>
                  <option value="Loan Repayment">Personal Loan Repayment</option>
                  <option value="Family Transfer">Family Transfer / Household Allowance</option>
                  <option value="Rental Income">Rental Income / Property Deposit</option>
                  <option value="Other">Other Miscellaneous Purpose</option>
                </select>
              </div>

              {/* Reason / Narrative */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  2. Brief Transaction Reason / Invoice Reference
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Sale of laptop on OLX / Project milestone #2"
                />
              </div>

              {/* Mock Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  3. Upload Supporting Document (Mock PDF / Invoice)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-3 bg-slate-950/70 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{selectedDoc}</div>
                        <div className="text-[10px] text-slate-400">PDF Document • 342 KB • Ready for submission</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc('Client_Agreement_Signed.pdf')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        Sample Contract
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDoc('GST_Tax_Invoice_894.pdf')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        Sample Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Two Outcomes */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Simulate Account Holder Response:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Outcome A: Provide Proof */}
                  <button
                    type="button"
                    onClick={handleConfirmProof}
                    className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Outcome A: Proof Provided</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Submit document & mark as <strong>Customer-Confirmed</strong>. Downgrades AML friction.
                    </p>
                  </button>

                  {/* Outcome B: Deny Payment */}
                  <button
                    type="button"
                    onClick={handleDeny}
                    className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Outcome B: Denies Payment</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Customer denies knowledge. Triggers <strong>CUSTOMER_DENIES (+40 Risk)</strong> & escalates case.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === 'success_confirmed' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Proof Submitted & Customer Confirmed</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                The evidence ({selectedDoc}) has been recorded. The transaction status is updated to <strong>"Customer Confirmed"</strong> and logged into the compliance audit trail.
              </p>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-900/40"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {activeStep === 'success_denied' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Customer Denied Knowledge of Payment</h4>
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 max-w-md mx-auto text-xs text-rose-200 text-left space-y-1">
                <div className="font-semibold text-white">⚡ Risk Engine Actions Executed:</div>
                <div>• Added <strong>CUSTOMER_DENIES signal (+40 points)</strong></div>
                <div>• Re-evaluated transaction score to <strong>Critical Risk</strong></div>
                <div>• Placed receiving account under <strong>Under Investigation</strong> status</div>
                <div>• Generated incident alert for Law Enforcement Agency (LEA) review</div>
              </div>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-rose-900/40"
                >
                  View Case in Investigation Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
