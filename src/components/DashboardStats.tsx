import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowUpRight, Activity, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { formatINR } from '../utils/riskEngine';

interface DashboardStatsProps {
  transactions: Transaction[];
  onFilterFlagged: () => void;
  onFilterMuleChain: () => void;
  onNavigateToCases: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  transactions,
  onFilterFlagged,
  onFilterMuleChain,
  onNavigateToCases,
}) => {
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const flagged = transactions.filter((t) => t.label === 'suspicious' || t.risk_score >= 50);
  const flaggedVolume = flagged.reduce((acc, t) => acc + t.amount, 0);
  
  const activeCases = transactions.filter(
    (t) => t.investigation_status === 'Under Investigation' || t.investigation_status === 'Customer Verification Pending'
  );
  
  const rapidForwardingTxns = transactions.filter(
    (t) => t.rapid_forward_minutes !== undefined && t.rapid_forward_minutes <= 15 && t.label === 'suspicious'
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat 1: Total Volume */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Volume Monitored</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            ₹{formatINR(totalVolume)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{transactions.length} transactions processed</span>
            <span className="text-emerald-400 font-medium">100% Ingested</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Flagged Transactions */}
      <div 
        onClick={onFilterFlagged}
        className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 shadow-sm transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-amber-400 transition-colors">
            Flagged Transactions
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono flex items-center justify-between">
            <span>{flagged.length}</span>
            <span className="text-xs font-sans font-normal text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {((flagged.length / Math.max(1, transactions.length)) * 100).toFixed(0)}% of rail
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>₹{formatINR(flaggedVolume)} at risk</span>
            <span className="text-amber-400 underline underline-offset-2 flex items-center text-[11px]">
              Filter table <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Stat 3: Active Investigations */}
      <div 
        onClick={onNavigateToCases}
        className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 shadow-sm transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-rose-400 transition-colors">
            Active Investigations
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold tracking-tight text-rose-400 font-mono flex items-center justify-between">
            <span>{activeCases.length}</span>
            <span className="text-xs font-sans font-normal text-rose-400/80 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              Requires Action
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Mule rings & complaint disputes</span>
            <span className="text-rose-400 underline underline-offset-2 flex items-center text-[11px]">
              Review queue <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Stat 4: Rapid Multi-Hop Chains */}
      <div 
        onClick={onFilterMuleChain}
        className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 shadow-sm transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-cyan-400 transition-colors">
            Rapid Mule Drain Chains
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold tracking-tight text-cyan-400 font-mono flex items-center justify-between">
            <span>{rapidForwardingTxns.length} hops</span>
            <span className="text-xs font-sans font-normal text-cyan-400/90 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              &lt; 15m Drained
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>4-Account syndicate chain</span>
            <span className="text-cyan-400 underline underline-offset-2 flex items-center text-[11px]">
              View in graph <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
