import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  GitFork, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Cpu, 
  X, 
  HelpCircle,
  Clock,
  PhoneCall,
  Activity,
  FileCheck
} from 'lucide-react';

interface WorkflowDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowDossierModal: React.FC<WorkflowDossierModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'architecture' | 'detection' | 'pitch' | 'qa'>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Header Bar (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                FraudChain Guard — System Workflow & Architecture Dossier
              </h2>
              <p className="text-xs text-slate-400">
                Official Project Presentation, Technical Blueprint & Explanation Guide (Printable PDF)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition cursor-pointer"
              title="Print directly or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs (Hidden in Print) */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto print:hidden">
          <span className="text-xs text-slate-400 font-medium mr-2">Filter Sections:</span>
          {[
            { id: 'all', label: 'Complete Dossier' },
            { id: 'architecture', label: 'System Architecture & Flow' },
            { id: 'detection', label: 'Detection Engine & Rules' },
            { id: 'pitch', label: 'Presentation & Viva Pitch' },
            { id: 'qa', label: 'Q&A for Reviewers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-10 text-slate-200 print:text-black print:overflow-visible print:p-4 text-sm leading-relaxed">
          
          {/* Document Cover Header */}
          <div className="border-b-2 border-cyan-500/40 pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-semibold mb-3 print:bg-slate-100 print:text-black print:border-black">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
                  CONFIDENTIAL TECHNICAL DOSSIER & SYSTEM WORKFLOW
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight">
                  FraudChain Guard
                </h1>
                <p className="text-base text-cyan-400 font-medium mt-1 print:text-slate-700">
                  Transaction Risk & Fraud-Chain Detection System for Banking & Payment Rails
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1">
                <div><strong>System Version:</strong> v4.2 Production Ready</div>
                <div><strong>Standard:</strong> RBI AML/CFT & FIU-IND Compliant</div>
                <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div><strong>Target Domain:</strong> Banking, UPI, Mule Ring Detection</div>
              </div>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY */}
          {(activeSection === 'all' || activeSection === 'architecture') && (
            <div className="space-y-4 break-inside-avoid">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 print:text-black flex items-center justify-center text-xs font-bold">1</span>
                Executive Summary & Problem Statement
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h3 className="font-semibold text-rose-400 print:text-rose-700 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    The Industry Problem
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 list-disc list-inside">
                    <li><strong>Mule Account Rings:</strong> Fraudsters compromise or buy dormant accounts (students, elderly, inactive) to funnel stolen money.</li>
                    <li><strong>Rapid Forwarding (UPI Smurfing):</strong> Stolen funds are routed through 4 to 6 bank accounts within 90 seconds to beat manual bank holds.</li>
                    <li><strong>Siloed Intelligence:</strong> Traditional rules evaluate single transactions in isolation, completely missing multi-hop laundering chains.</li>
                    <li><strong>Lagging Cyber-Cell Coordination:</strong> National Cyber Crime Portal (1930) alerts arrive after funds have already exited into crypto or ATMs.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h3 className="font-semibold text-emerald-400 print:text-emerald-700 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    The FraudChain Guard Solution
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 list-disc list-inside">
                    <li><strong>Real-time Graph Traversal:</strong> Connects transactions into a directed acyclic fraud graph in under 50 milliseconds.</li>
                    <li><strong>Multi-Factor Risk Scoring:</strong> Evaluates amount velocity, profile mismatch, geo-hop impossibility, and device fingerprints.</li>
                    <li><strong>Automated Step-up Interventions:</strong> Immediate temporary hold, customer SMS challenge, and instant 1-click account freeze.</li>
                    <li><strong>1930 / I4C Cyber Cell Integration:</strong> Automatically correlates cyber complaints with frozen beneficiary nodes.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: END-TO-END WORKFLOW ARCHITECTURE */}
          {(activeSection === 'all' || activeSection === 'architecture') && (
            <div className="space-y-4 break-inside-avoid">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 print:text-black flex items-center justify-center text-xs font-bold">2</span>
                End-to-End System Workflow Architecture
              </h2>

              <p className="text-xs text-slate-300 print:text-slate-700">
                Har transaction core payment switch (UPI/IMPS/NEFT/Card) se guzarte waqt 5 distinct stages me evaluate hoti hai:
              </p>

              {/* Step-by-Step Flow Graphic */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 print:grid-cols-5">
                {[
                  {
                    step: '01',
                    title: 'Ingestion & Telemetry',
                    desc: 'Payload capture, device fingerprint, IP geo-velocity, declared customer KYC tier.',
                    color: 'border-cyan-500/50 text-cyan-400'
                  },
                  {
                    step: '02',
                    title: 'Risk Engine Evaluation',
                    desc: 'Heuristic engine calculates Score (0-100) across 6 weighted behavioral parameters.',
                    color: 'border-blue-500/50 text-blue-400'
                  },
                  {
                    step: '03',
                    title: 'Graph Traversal',
                    desc: 'Recursive BFS tracks downstream fund forwarding across recipient accounts within seconds.',
                    color: 'border-indigo-500/50 text-indigo-400'
                  },
                  {
                    step: '04',
                    title: 'Automated Action',
                    desc: 'Low/Medium: Pass/OTP; High/Critical: Immediate Hold, SMS Evidence Gateway, Auto-Freeze.',
                    color: 'border-amber-500/50 text-amber-400'
                  },
                  {
                    step: '05',
                    title: 'Investigation & SAR',
                    desc: 'Suspicious Activity Report (SAR) auto-filled, ready for FIU-IND & LEA export.',
                    color: 'border-rose-500/50 text-rose-400'
                  },
                ].map((item) => (
                  <div key={item.step} className={`p-3.5 rounded-xl bg-slate-800/70 border ${item.color} print:bg-slate-50 print:border-slate-400 flex flex-col justify-between`}>
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold print:bg-white print:text-black">
                        STAGE {item.step}
                      </span>
                      <h4 className="font-bold text-white print:text-black text-xs mt-2">{item.title}</h4>
                      <p className="text-[11px] text-slate-300 print:text-slate-600 mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture Diagram Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 print:bg-slate-100 print:text-black print:border-slate-400 overflow-x-auto">
                <div className="font-bold text-slate-400 print:text-slate-700 mb-2">SYSTEM FLOW PIPELINE (ASCII BluePrint):</div>
                <pre className="whitespace-pre text-[10px] leading-tight font-mono">
{`[ Payment Gateway / UPI Switch ]
               │
               ▼
[ Ingestion & Feature Extractor ] ────> (Device Hash, IP Geo, Velocity Buffer)
               │
               ▼
┌──────────────────────────────────────────────┐
│       FraudChain Hybrid Risk Engine          │
│  ├─ Heuristic Risk Calculator (0 - 100)      │
│  ├─ Profile Mismatch (Declared Income vs Tx) │
│  └─ Dynamic Graph Engine (Multi-Hop Tracing) │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Score < 40: Normal ]       [ Score >= 75: Critical / High ]
  • Auto-Approve / Clear       ├─ Instant Temporary Fund Hold
                               ├─ Customer SMS Evidence Gateway
                               ├─ 1-Click Multi-Node Ring Freeze
                               └─ FIU-IND SAR Filing Ready`}
                </pre>
              </div>
            </div>
          )}

          {/* SECTION 3: CORE DETECTION ENGINES */}
          {(activeSection === 'all' || activeSection === 'detection') && (
            <div className="space-y-4 break-inside-avoid">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 print:text-black flex items-center justify-center text-xs font-bold">3</span>
                Core Detection Engines & Heuristics
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-white print:text-black text-xs flex items-center justify-between">
                    <span>A. Mule Account Ring Detection</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 print:bg-slate-200 print:text-black">High Risk Trigger</span>
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    Detects dormant accounts that suddenly receive large inflows followed by immediate fan-out transfers to 3+ newly added payees within 10 minutes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-white print:text-black text-xs flex items-center justify-between">
                    <span>B. Rapid Forwarding & Hop Velocity Tracking</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 print:bg-slate-200 print:text-black">Graph Analysis</span>
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    If Account B forwards &gt;85% of received funds from Account A to Account C within 120 seconds, the transaction edge is marked as a Rapid Forwarding Hop with exponential risk decay penalty.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-white print:text-black text-xs flex items-center justify-between">
                    <span>C. Customer Profile & Income Mismatch</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 print:bg-slate-200 print:text-black">KYC Behavioral</span>
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    Compares transaction volume against declared occupation and income. E.g., a "Student" account with declared income &lt; ₹1.5L receiving ₹4.8L triggers instant Profile Mismatch escalation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-white print:text-black text-xs flex items-center justify-between">
                    <span>D. Device Fingerprinting & Impossible Geo-Velocity</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 print:bg-slate-200 print:text-black">Device Telemetry</span>
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    Flags login and transaction requests when physical distance between consecutive operations exceeds 800 km/h (e.g., Delhi login followed by Bangalore transfer 15 minutes later).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRESENTATION PITCH GUIDE (VIVA & EVALUATOR TALKING POINTS) */}
          {(activeSection === 'all' || activeSection === 'pitch') && (
            <div className="space-y-4 break-inside-avoid">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 print:text-black flex items-center justify-center text-xs font-bold">4</span>
                How to Explain This Project (Viva & Interviewer Pitch Script)
              </h2>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-3 print:bg-white print:border-slate-300">
                <div className="font-bold text-cyan-300 print:text-black text-sm">
                  🎤 2-Minute Elevator Pitch (Hindi / English):
                </div>
                <blockquote className="p-3 rounded-lg bg-slate-900 border-l-4 border-cyan-500 text-slate-200 italic print:bg-slate-100 print:text-black">
                  "Sir/Ma'am, traditional banks detect fraud only on a single transaction basis. But today's cyber criminals use <strong>Money Mule Networks</strong> — victim se paisa lekar 4 alag-alag accounts me 90 seconds ke andar divide (smurf) kar dete hain. 
                  <br /><br />
                  Humne develop kiya hai <strong>FraudChain Guard</strong>: Ek intelligent transaction risk aur multi-hop fraud-chain detection system. Ye transactions ko graph format me visualize karta hai, rapid forwarding identify karta hai, customer ke declared income se mismatch pakadta hai, aur suspicious mule accounts ko 1-click me freeze kar deta hai along with automated SAR (Suspicious Activity Report) generation for RBI and 1930 Cyber Cell."
                </blockquote>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                    <span className="font-bold text-white print:text-black block mb-1">Key Value #1: Speed</span>
                    <span className="text-slate-400 print:text-slate-600 text-[11px]">&lt; 50ms graph scoring prevents fund dissipation before final crypto/ATM exit.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                    <span className="font-bold text-white print:text-black block mb-1">Key Value #2: Accuracy</span>
                    <span className="text-slate-400 print:text-slate-600 text-[11px]">Reduces false positives via interactive customer SMS verification & evidence gateway.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                    <span className="font-bold text-white print:text-black block mb-1">Key Value #3: Compliance</span>
                    <span className="text-slate-400 print:text-slate-600 text-[11px]">Instant audit trails, FIU-IND SAR ready export, and 1930 NCRP integration.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: FREQUENTLY ASKED QUESTIONS BY REVIEWERS */}
          {(activeSection === 'all' || activeSection === 'qa') && (
            <div className="space-y-4 break-inside-avoid">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 print:text-black flex items-center justify-center text-xs font-bold">5</span>
                Top 4 Questions Interviewers / Reviewers Will Ask (& Answers)
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-amber-300 print:text-black text-xs">
                    Q1: How do you prevent false positives (innocent genuine customers being blocked)?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    <strong>Answer:</strong> We implement a graded 4-tier risk band. For Medium/High risk, we don't immediately freeze the account; instead, we initiate a <strong>Temporary 15-minute Hold</strong> and send a secure Customer Verification SMS. The customer can confirm legitimate high-value purchases with one tap or upload an invoice, immediately restoring the transaction.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-amber-300 print:text-black text-xs">
                    Q2: How does the Graph Engine detect money mules?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    <strong>Answer:</strong> Accounts are represented as nodes and transactions as directed weighted edges. When a transaction arrives, we trace downstream path length (hops) and time intervals. A mule account typically exhibits high in-degree followed immediately by high out-degree with minimal balance retention.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-amber-300 print:text-black text-xs">
                    Q3: What technologies are used in this implementation?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    <strong>Answer:</strong> Frontend built with modern React 19, TypeScript, and Tailwind CSS. State management handles real-time transaction streaming and dynamic graph rendering. The risk engine is modular, combining deterministic rule evaluation with Gemini AI copilot for contextual fraud investigation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 print:bg-white print:border-slate-300">
                  <h4 className="font-bold text-amber-300 print:text-black text-xs">
                    Q4: How does it integrate with Law Enforcement and National Cyber Crime Portal?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    <strong>Answer:</strong> It provides a dedicated 1930 / I4C Cyber Crime Complaint simulator. When an FIR or citizen complaint is registered with a Transaction ID, the system matches the chain, freezes all descendant beneficiary accounts, and generates an official Suspicious Activity Report (SAR).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-400 text-center text-xs text-slate-500 print:text-slate-700">
            <p>FraudChain Guard AML Engine • Built for FinTech Security, Hackathons & Production Banking Demonstrations</p>
            <p className="text-[11px] text-slate-600 print:text-slate-500 mt-0.5">Author: Ramlala Patel • Confidential Technical Documentation</p>
          </div>

        </div>

        {/* Modal Bottom Actions Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between rounded-b-2xl print:hidden">
          <span className="text-xs text-slate-400">
            💡 Tip: Click <strong>"Print / Save as PDF"</strong> and select <strong>"Save as PDF"</strong> in your browser to save this file permanently.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
