import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Scale, ShieldCheck } from 'lucide-react';

export const EthicsBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside aria-label="Ethics and Regulatory Compliance Notice" className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-blue-950/40 border-b border-amber-500/20 text-xs text-amber-200/90 px-4 py-2 relative backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-400 shrink-0">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold tracking-wide text-amber-300">
            ETHICS & REGULATORY COMPLIANCE NOTICE:
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Risk scores and mule indicators are probabilistic signals for human-in-the-loop analyst review.
          </span>
          <span className="text-amber-400/90 font-medium">
            No automated account freeze or debit reversals occur in this prototype.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0 text-[11px] underline underline-offset-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          {expanded ? 'Hide Safeguards' : 'View Fair-Lending Safeguards'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-500/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
          <div className="flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-100">Human-in-the-Loop Requirement:</strong>
              <p className="text-slate-400 mt-0.5">High-risk scores flag accounts for review; only certified AML officers can file 1930 / FIU escalation requests.</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-100">Auditable Scoring Weights:</strong>
              <p className="text-slate-400 mt-0.5">All +5 to +40 signal additions are explainable and derived from explicit regulatory indicators (RBI/FIU-IND mandates).</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-100">Customer Right of Explanation:</strong>
              <p className="text-slate-400 mt-0.5">Triggered accounts are granted evidence submission windows before any restrictive classification is logged.</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
