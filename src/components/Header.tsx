import React from 'react';
import { 
  ShieldAlert, 
  GitFork, 
  LayoutDashboard, 
  FileSearch, 
  Zap, 
  Sliders, 
  Sparkles, 
  PlusCircle, 
  RefreshCw,
  MessageSquare,
  Radio,
  FileText
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'graph' | 'cases' | 'triggers' | 'simulator';
  setActiveTab: (tab: 'dashboard' | 'graph' | 'cases' | 'triggers' | 'simulator') => void;
  onInjectSpike: () => void;
  onResetData: () => void;
  onLaunchDemoTour: (tourId: string) => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
  onOpenWorkflowPdf: () => void;
  activeCasesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onInjectSpike,
  onResetData,
  onLaunchDemoTour,
  onOpenChat,
  onOpenVoice,
  onOpenWorkflowPdf,
  activeCasesCount,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    FraudChain <span className="text-cyan-400">Guard</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    BANK AML ENGINE v4.2
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Transaction Risk & Mule Money Chain Detection Prototype
                </p>
              </div>
            </div>

            {/* Live Indicator on Mobile */}
            <div className="flex items-center gap-1.5 lg:hidden px-2 py-1 rounded bg-slate-800 text-[11px] text-emerald-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </div>
          </div>

          {/* Quick Demo Tour Launchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px] text-slate-400">Stream: Active</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-medium text-[11px]">Simulated Core Rail</span>
            </div>

            {/* Expo Scenario Dropdown / Quick Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Demo:
              </span>
              <button
                onClick={() => onLaunchDemoTour('mule-chain')}
                className="px-2 py-1 text-xs rounded bg-slate-700/70 hover:bg-cyan-600 hover:text-white text-slate-200 transition-all font-medium cursor-pointer"
                title="Inspect 4-hop mule ring from victim to crypto exit"
              >
                4-Hop Mule Chain
              </button>
              <button
                onClick={() => onLaunchDemoTour('profile-mismatch')}
                className="px-2 py-1 text-xs rounded bg-slate-700/70 hover:bg-amber-600 hover:text-white text-slate-200 transition-all font-medium cursor-pointer"
                title="See Student KYC Limit vs ₹4.80L credit"
              >
                Profile Mismatch
              </button>
              <button
                onClick={() => onLaunchDemoTour('complaint')}
                className="px-2 py-1 text-xs rounded bg-slate-700/70 hover:bg-rose-600 hover:text-white text-slate-200 transition-all font-medium cursor-pointer"
                title="Simulate 1930 Cyber Cell Complaint"
              >
                File Complaint
              </button>
            </div>

            {/* Inject Transaction Spike */}
            <button
              onClick={onInjectSpike}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-900/40 transition cursor-pointer"
              title="Inject a high-risk layered transaction in real time"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Inject Spike</span>
            </button>

            {/* AI Copilot Chatbot */}
            <button
              onClick={onOpenChat}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-900/40 transition cursor-pointer border border-blue-400/40"
              title="Open Multi-Turn Gemini AML Intelligence Copilot"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AML Copilot</span>
            </button>

            {/* Gemini Live Voice */}
            <button
              onClick={onOpenVoice}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-purple-900/40 transition cursor-pointer border border-purple-400/40 relative"
              title="Real-Time Voice Conversation with gemini-3.8-live"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-purple-200" />
              <span>Live Voice</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {/* Workflow PDF & Presentation Dossier */}
            <button
              onClick={onOpenWorkflowPdf}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-900/40 transition cursor-pointer border border-emerald-400/40"
              title="Open Printable Workflow PDF & Viva/Presentation Dossier"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Workflow PDF</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer"
              title="Reset simulation to default state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview & Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                activeTab === 'graph'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Fraud Chain Graph</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </button>

            <button
              onClick={() => setActiveTab('cases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'cases'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Investigation Panel</span>
              {activeCasesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeCasesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('triggers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'triggers'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Triggers & Scrutiny</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Risk Engine Matrix</span>
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-500">Node ID: IN-MUM-CENTRAL-01</span>
          </div>
        </div>
      </div>
    </header>
  );
};
