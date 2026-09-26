/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Account, CyberComplaint, EvidenceSubmission, RiskBand, Transaction } from './types';
import { INITIAL_ACCOUNTS, initializeSeedTransactions } from './data/seedData';
import { computeRiskScore, evaluateProfileMismatch } from './utils/riskEngine';
import { Header } from './components/Header';
import { EthicsBanner } from './components/EthicsBanner';
import { DashboardStats } from './components/DashboardStats';
import { RiskBandChart } from './components/RiskBandChart';
import { TransactionsTable } from './components/TransactionsTable';
import { FraudChainGraph } from './components/FraudChainGraph';
import { InvestigationPanel } from './components/InvestigationPanel';
import { ProfileMismatchModal } from './components/ProfileMismatchModal';
import { ComplaintModal } from './components/ComplaintModal';
import { CustomerVerificationModal } from './components/CustomerVerificationModal';
import { TransactionDetailDrawer } from './components/TransactionDetailDrawer';
import { RiskEngineSimulator } from './components/RiskEngineSimulator';
import { TriggersHub } from './components/TriggersHub';
import { IncidentReportModal } from './components/IncidentReportModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, X, MessageSquare, Radio, Bot } from 'lucide-react';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    initializeSeedTransactions(INITIAL_ACCOUNTS)
  );

  const [activeTab, setActiveTab] = useState<'dashboard' | 'graph' | 'cases' | 'triggers' | 'simulator'>('dashboard');
  const [selectedBand, setSelectedBand] = useState<RiskBand | 'ALL'>('ALL');

  // Modals & Drawers state
  const [selectedTxnForDrawer, setSelectedTxnForDrawer] = useState<Transaction | null>(null);
  const [targetTxnForModal, setTargetTxnForModal] = useState<Transaction | null>(null);
  const [activeModal, setActiveModal] = useState<'profileMismatch' | 'complaint' | 'verification' | 'exportReport' | null>(null);
  const [preselectedTxnIdForComplaint, setPreselectedTxnIdForComplaint] = useState<string | undefined>(undefined);

  // Gemini AI Chatbot & Voice Conversations
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const accountsMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Re-sync transaction in drawer if updated
  const syncSelectedTxn = (updatedList: Transaction[]) => {
    if (selectedTxnForDrawer) {
      const match = updatedList.find((t) => t.transaction_id === selectedTxnForDrawer.transaction_id);
      if (match) setSelectedTxnForDrawer(match);
    }
  };

  // Handle Submit Customer Proof
  const handleSubmitProof = (txnId: string, evidence: EvidenceSubmission) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;

        const newNote = {
          id: `N-${Date.now()}`,
          author: 'Customer Mobile Gateway',
          role: 'SMS Evidence Portal',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Customer provided proof [${evidence.purposeCategory}]: "${evidence.description}". Document "${evidence.documentName}" verified.`,
        };

        return {
          ...t,
          evidence,
          investigation_status: 'Customer Confirmed' as const,
          notes: [newNote, ...t.notes],
        };
      });
      syncSelectedTxn(next);
      return next;
    });

    showToast(`Proof recorded for ${txnId}. Status marked as Customer Confirmed.`, 'success');
  };

  // Handle Customer Denial
  const handleDenyPayment = (txnId: string, denialReason: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;

        const updatedSignals = Array.from(new Set([...t.signals, 'CUSTOMER_DENIES']));
        const rec = computeRiskScore(t, accountsMap, updatedSignals);

        const newNote = {
          id: `N-${Date.now()}`,
          author: 'Customer Mobile Gateway',
          role: 'Fraud Report Desk',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `CUSTOMER DENIAL REPORTED: ${denialReason}. Risk elevated by +40 points. Account marked for freeze triage.`,
        };

        return {
          ...t,
          signals: updatedSignals,
          risk_score: rec.score,
          risk_band: rec.band,
          detected_signals: rec.detectedSignals,
          investigation_status: 'Under Investigation' as const,
          evidence: {
            purposeCategory: 'Other' as const,
            description: denialReason,
            submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'denied' as const,
            denialReason,
          },
          notes: [newNote, ...t.notes],
        };
      });
      syncSelectedTxn(next);
      return next;
    });

    // Mark the receiving account as Under Investigation
    const targetTx = transactions.find((t) => t.transaction_id === txnId);
    if (targetTx) {
      setAccounts((prevAccs) =>
        prevAccs.map((acc) =>
          acc.id === targetTx.receiver_id ? { ...acc, risk_status: 'Under Investigation' } : acc
        )
      );
    }

    showToast(`ALERT: Customer denied knowledge of payment ${txnId}. Risk elevated to Critical!`, 'alert');
  };

  // Handle File Cyber Complaint
  const handleSubmitComplaint = (txnId: string, complaint: CyberComplaint, analystNoteText: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;

        const updatedSignals = Array.from(new Set([...t.signals, 'LINKED_TO_SUSPICIOUS', 'SENDER_SUSPICIOUS']));
        const rec = computeRiskScore(t, accountsMap, updatedSignals);

        const newNote = {
          id: `N-${Date.now()}`,
          author: 'Cyber Desk Ingest (1930)',
          role: 'Analyst',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: analystNoteText,
        };

        return {
          ...t,
          complaint,
          signals: updatedSignals,
          risk_score: rec.score,
          risk_band: rec.band,
          detected_signals: rec.detectedSignals,
          investigation_status: 'Under Investigation' as const,
          notes: [newNote, ...t.notes],
        };
      });
      syncSelectedTxn(next);
      return next;
    });

    showToast(`Cyber complaint ref ${complaint.portal_ref} filed against ${txnId}. Evidence request triggered.`, 'alert');
  };

  // Handle Case Status Update
  const handleUpdateStatus = (txnId: string, status: Transaction['investigation_status']) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;
        const newNote = {
          id: `N-${Date.now()}`,
          author: 'AML Compliance Officer',
          role: 'Analyst Ops',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Case disposition changed to: ${status}.`,
        };
        return {
          ...t,
          investigation_status: status,
          notes: [newNote, ...t.notes],
        };
      });
      syncSelectedTxn(next);
      return next;
    });
    showToast(`Case ${txnId} status updated to: ${status}`, 'info');
  };

  // Handle Add Case Note
  const handleAddCaseNote = (txnId: string, noteText: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;
        const newNote = {
          id: `N-${Date.now()}`,
          author: 'Fraud Risk Analyst',
          role: 'Level 2 Reviewer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: noteText,
        };
        return {
          ...t,
          notes: [newNote, ...t.notes],
        };
      });
      syncSelectedTxn(next);
      return next;
    });
    showToast(`Analyst note recorded on ${txnId}`, 'success');
  };

  // Handle Interactive Signal Toggling in Drawer
  const handleUpdateSignals = (txnId: string, updatedSignalCodes: string[]) => {
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.transaction_id !== txnId) return t;
        const rec = computeRiskScore(t, accountsMap, updatedSignalCodes);
        return {
          ...t,
          signals: updatedSignalCodes,
          risk_score: rec.score,
          risk_band: rec.band,
          detected_signals: rec.detectedSignals,
          label: rec.label,
        };
      });
      syncSelectedTxn(next);
      return next;
    });
  };

  // Demo Tour Launcher
  const handleLaunchDemoTour = (tourId: string) => {
    if (tourId === 'mule-chain') {
      setActiveTab('graph');
      const target = transactions.find((t) => t.transaction_id === 'TXN-894202');
      if (target) {
        setSelectedTxnForDrawer(target);
      }
      showToast('Tour loaded: Inspecting 4-Hop Rapid Money Forwarding Chain', 'info');
    } else if (tourId === 'profile-mismatch') {
      const target = transactions.find((t) => t.transaction_id === 'TXN-894202');
      if (target) {
        setTargetTxnForModal(target);
        setActiveModal('profileMismatch');
      }
      showToast('Tour loaded: Inspecting Student Profile Mismatch (+19.2x Limit)', 'info');
    } else if (tourId === 'complaint') {
      const target = transactions.find((t) => t.transaction_id === 'TXN-894201');
      if (target) {
        setTargetTxnForModal(target);
        setPreselectedTxnIdForComplaint(target.transaction_id);
        setActiveModal('complaint');
      }
      showToast('Tour loaded: Filing 1930 Cyber Crime Complaint on Transaction', 'info');
    }
  };

  // Inject High-Risk Fraud Spike Simulation
  const handleInjectSpike = () => {
    const newTxnId = `TXN-SPIKE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAmount = 375000;
    const receiverAcc = accounts.find((a) => a.id === 'ACC-MUL-01') || accounts[2]; // Student Aarav

    const raw = {
      transaction_id: newTxnId,
      sender_id: 'ACC-FRD-01', // Apex Digital
      receiver_id: receiverAcc.id,
      amount: newAmount,
      timestamp: new Date().toISOString(),
      display_time: 'Just Now',
      type: 'IMPS' as const,
      label: 'suspicious' as const,
      signals: ['SENDER_SUSPICIOUS', 'UNUSUAL_AMOUNT', 'RAPID_MULTIHOP', 'LINKED_TO_SUSPICIOUS'],
      investigation_status: 'Customer Verification Pending' as const,
      is_fraud_chain_part: true,
      chain_role: 'Mule Account A' as const,
      rapid_forward_minutes: 3,
      notes: [
        {
          id: `N-${Date.now()}`,
          author: 'Real-Time Ingestion Sensor',
          role: 'Core Rail Watcher',
          timestamp: 'Just now',
          text: `LIVE SPIKE DETECTED: Rapid IMPS inward credit of ₹3,75,000 received on Student account. Automated evidence request SMS sent.`,
        },
      ],
    };

    const evaluated = computeRiskScore(raw, accountsMap);
    const deviation = evaluateProfileMismatch(newAmount, receiverAcc);

    const fullTxn: Transaction = {
      ...raw,
      risk_score: evaluated.score,
      risk_band: evaluated.band,
      detected_signals: evaluated.detectedSignals,
      label: evaluated.label,
      profile_deviation: deviation.isMismatch
        ? {
            account_limit_max: deviation.maxLimit,
            multiplier: deviation.multiplier,
            is_mismatch: true,
          }
        : undefined,
    };

    setTransactions((prev) => [fullTxn, ...prev]);
    setSelectedTxnForDrawer(fullTxn);
    showToast(`🚨 Simulated High-Risk Spike Ingested: ${newTxnId} (Score: ${fullTxn.risk_score})`, 'alert');
  };

  // Reset Simulation Data
  const handleResetData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(initializeSeedTransactions(INITIAL_ACCOUNTS));
    setSelectedBand('ALL');
    setSelectedTxnForDrawer(null);
    setActiveModal(null);
    showToast('Simulation dataset reset to initial state.', 'info');
  };

  const activeCasesCount = transactions.filter(
    (t) => t.investigation_status === 'Under Investigation' || t.investigation_status === 'Customer Verification Pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Ethics & Regulatory Notice */}
      <EthicsBanner />

      {/* Main Bank Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onInjectSpike={handleInjectSpike}
        onResetData={handleResetData}
        onLaunchDemoTour={handleLaunchDemoTour}
        onOpenChat={() => setIsChatbotOpen(true)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        activeCasesCount={activeCasesCount}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* TAB 1: OVERVIEW & LEDGER */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <DashboardStats
              transactions={transactions}
              onFilterFlagged={() => setSelectedBand('Critical')}
              onFilterMuleChain={() => {
                setActiveTab('graph');
              }}
              onNavigateToCases={() => setActiveTab('cases')}
            />

            {/* Risk-Band Chart */}
            <RiskBandChart
              transactions={transactions}
              selectedBand={selectedBand}
              onSelectBand={setSelectedBand}
            />

            {/* Transaction Ledger Table */}
            <TransactionsTable
              transactions={transactions}
              accountsMap={accountsMap}
              selectedBand={selectedBand}
              onSelectTransaction={(tx) => setSelectedTxnForDrawer(tx)}
              onViewInGraph={(tx) => {
                setSelectedTxnForDrawer(tx);
                setActiveTab('graph');
              }}
              onOpenProfileMismatch={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('profileMismatch');
              }}
              onOpenCustomerVerification={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('verification');
              }}
              onOpenFileComplaint={(tx) => {
                setTargetTxnForModal(tx);
                setPreselectedTxnIdForComplaint(tx.transaction_id);
                setActiveModal('complaint');
              }}
            />
          </div>
        )}

        {/* TAB 2: INTERACTIVE FRAUD CHAIN GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-6 animate-fadeIn">
            <FraudChainGraph
              accounts={accounts}
              transactions={transactions}
              selectedTransactionId={selectedTxnForDrawer?.transaction_id}
              onSelectTransaction={(tx) => setSelectedTxnForDrawer(tx)}
              onOpenCustomerVerification={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('verification');
              }}
              onOpenProfileMismatch={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('profileMismatch');
              }}
            />
          </div>
        )}

        {/* TAB 3: CASE INVESTIGATION PANEL */}
        {activeTab === 'cases' && (
          <div className="space-y-6 animate-fadeIn">
            <InvestigationPanel
              transactions={transactions}
              accountsMap={accountsMap}
              onSelectTransaction={(tx) => setSelectedTxnForDrawer(tx)}
              onViewInGraph={(tx) => {
                setSelectedTxnForDrawer(tx);
                setActiveTab('graph');
              }}
              onOpenCustomerVerification={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('verification');
              }}
              onUpdateStatus={handleUpdateStatus}
              onAddCaseNote={handleAddCaseNote}
              onExportReport={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('exportReport');
              }}
            />
          </div>
        )}

        {/* TAB 4: TRIGGERS & SCRUTINY HUB */}
        {activeTab === 'triggers' && (
          <div className="space-y-6 animate-fadeIn">
            <TriggersHub
              accounts={accounts}
              transactions={transactions}
              onOpenProfileMismatch={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('profileMismatch');
              }}
              onOpenFileComplaint={(tx) => {
                setTargetTxnForModal(tx);
                setPreselectedTxnIdForComplaint(tx.transaction_id);
                setActiveModal('complaint');
              }}
              onOpenCustomerVerification={(tx) => {
                setTargetTxnForModal(tx);
                setActiveModal('verification');
              }}
            />
          </div>
        )}

        {/* TAB 5: RISK ENGINE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fadeIn">
            <RiskEngineSimulator />
          </div>
        )}
      </main>

      {/* Floating Action / Live Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div className={`p-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium border backdrop-blur-md ${
            toast.type === 'alert'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-900/30'
              : toast.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-500/50 shadow-blue-900/30'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-900/30'
          }`}>
            {toast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Profile Mismatch Modal */}
      <ProfileMismatchModal
        transaction={targetTxnForModal}
        accountsMap={accountsMap}
        isOpen={activeModal === 'profileMismatch'}
        onClose={() => setActiveModal(null)}
        onOpenCustomerVerification={(tx) => {
          setActiveModal('verification');
          setTargetTxnForModal(tx);
        }}
      />

      {/* 2. Cyber Complaint Modal */}
      <ComplaintModal
        isOpen={activeModal === 'complaint'}
        onClose={() => setActiveModal(null)}
        transactions={transactions}
        accountsMap={accountsMap}
        preselectedTxnId={preselectedTxnIdForComplaint}
        onSubmitComplaint={handleSubmitComplaint}
      />

      {/* 3. Customer Verification Modal */}
      <CustomerVerificationModal
        transaction={targetTxnForModal}
        accountsMap={accountsMap}
        isOpen={activeModal === 'verification'}
        onClose={() => setActiveModal(null)}
        onSubmitProof={handleSubmitProof}
        onDenyPayment={handleDenyPayment}
      />

      {/* 4. Incident SAR Report Modal */}
      <IncidentReportModal
        transaction={targetTxnForModal}
        accountsMap={accountsMap}
        isOpen={activeModal === 'exportReport'}
        onClose={() => setActiveModal(null)}
      />

      {/* 5. Transaction Detail Slide-Over Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTxnForDrawer}
        accountsMap={accountsMap}
        isOpen={selectedTxnForDrawer !== null}
        onClose={() => setSelectedTxnForDrawer(null)}
        onViewInGraph={(tx) => {
          setActiveTab('graph');
        }}
        onOpenCustomerVerification={(tx) => {
          setTargetTxnForModal(tx);
          setActiveModal('verification');
        }}
        onOpenProfileMismatch={(tx) => {
          setTargetTxnForModal(tx);
          setActiveModal('profileMismatch');
        }}
        onOpenFileComplaint={(tx) => {
          setTargetTxnForModal(tx);
          setPreselectedTxnIdForComplaint(tx.transaction_id);
          setActiveModal('complaint');
        }}
        onUpdateSignals={handleUpdateSignals}
        onConsultCopilot={(tx) => {
          setIsChatbotOpen(true);
        }}
      />

      {/* 6. Gemini Multi-Turn AML Intelligence Chatbot */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        accounts={accounts}
        transactions={transactions}
        onSelectTransaction={(tx) => {
          setSelectedTxnForDrawer(tx);
        }}
      />

      {/* 7. Gemini 3.8 Live API Voice Conversation Modal */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Floating Action Trigger Dock for Fast Access */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-950/60 border border-cyan-400/40 cursor-pointer hover:scale-105 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>AML Copilot</span>
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
        </button>

        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-indigo-950/60 border border-purple-400/40 cursor-pointer hover:scale-105 transition-all"
        >
          <Radio className="w-4 h-4 text-purple-200 animate-pulse" />
          <span>Live Voice</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FraudChain Guard</span>
            <span>• College Tech Expo Demonstration Prototype</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Client-Side Autonomous Simulation • Zero Real Banking Integration
          </div>
        </div>
      </footer>
    </div>
  );
}
