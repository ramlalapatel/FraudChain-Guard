import React, { useState, useMemo } from 'react';
import { Account, Transaction } from '../types';
import { formatINR, getRiskBandColor } from '../utils/riskEngine';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  CheckCircle2,
  GitCommit
} from 'lucide-react';

interface FraudChainGraphProps {
  accounts: Account[];
  transactions: Transaction[];
  selectedTransactionId?: string;
  onSelectTransaction: (tx: Transaction) => void;
  onSelectAccount?: (acc: Account) => void;
  onOpenCustomerVerification: (tx: Transaction) => void;
  onOpenProfileMismatch: (tx: Transaction) => void;
}

interface NodeLayout {
  id: string;
  x: number;
  y: number;
  account: Account;
  role: 'victim' | 'fraudster' | 'mule_a' | 'mule_b' | 'cashout' | 'mule_c' | 'normal' | 'corporate';
}

export const FraudChainGraph: React.FC<FraudChainGraphProps> = ({
  accounts,
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onOpenCustomerVerification,
  onOpenProfileMismatch,
}) => {
  const [viewPreset, setViewPreset] = useState<'MAIN_CHAIN' | 'COLLECTION_SMURFING' | 'FULL_NETWORK'>('MAIN_CHAIN');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const accountsMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const transactionsMap = useMemo(() => new Map(transactions.map((t) => [t.transaction_id, t])), [transactions]);

  // Define layout positions for aesthetic clarity and presentation
  const nodePositions: Record<string, { x: number; y: number; role: NodeLayout['role'] }> = {
    // 4-Hop Main Chain
    'ACC-VIC-01': { x: 90, y: 220, role: 'victim' }, // Ramesh Kulkarni
    'ACC-FRD-01': { x: 310, y: 220, role: 'fraudster' }, // Apex Digital
    'ACC-MUL-01': { x: 540, y: 220, role: 'mule_a' }, // Aarav Sharma (Student Mule A)
    'ACC-MUL-02': { x: 770, y: 220, role: 'mule_b' }, // Sunita Devi (Homemaker Mule B)
    'ACC-CSH-01': { x: 990, y: 220, role: 'cashout' }, // CoinBridge OTC (Exit)

    // Smurfing / Collection Branch
    'ACC-VIC-02': { x: 90, y: 80, role: 'victim' }, // Priya Nambiar
    'ACC-MUL-03': { x: 310, y: 80, role: 'mule_c' }, // Karan Mehra (Student Mule C)
    'ACC-LEG-01': { x: 200, y: 390, role: 'normal' }, // Kavita Rao
    'ACC-LEG-02': { x: 500, y: 390, role: 'normal' }, // Green Valley Mart
    'ACC-LEG-03': { x: 370, y: 460, role: 'normal' }, // Prestige Society
    'ACC-CORP-01': { x: 770, y: 80, role: 'corporate' }, // Nexus Logistics
    'ACC-LEG-04': { x: 700, y: 390, role: 'normal' }, // Ananya Sen
    'ACC-LEG-05': { x: 880, y: 390, role: 'normal' }, // Dr. Arvind
  };

  // Determine active visible transactions and nodes based on preset
  const visibleTransactions = useMemo(() => {
    if (viewPreset === 'MAIN_CHAIN') {
      return transactions.filter(
        (t) =>
          ['TXN-894201', 'TXN-894202', 'TXN-894203', 'TXN-894204'].includes(t.transaction_id)
      );
    }
    if (viewPreset === 'COLLECTION_SMURFING') {
      return transactions.filter(
        (t) =>
          ['TXN-894208', 'TXN-894209', 'TXN-894210', 'TXN-894201'].includes(t.transaction_id)
      );
    }
    // Full network
    return transactions;
  }, [viewPreset, transactions]);

  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    visibleTransactions.forEach((t) => {
      ids.add(t.sender_id);
      ids.add(t.receiver_id);
    });
    return ids;
  }, [visibleTransactions]);

  const nodes: NodeLayout[] = useMemo(() => {
    const list: NodeLayout[] = [];
    accounts.forEach((acc) => {
      if (visibleNodeIds.has(acc.id)) {
        const pos = nodePositions[acc.id] || { x: 500, y: 300, role: 'normal' };
        list.push({
          id: acc.id,
          x: pos.x,
          y: pos.y,
          account: acc,
          role: pos.role,
        });
      }
    });
    return list;
  }, [accounts, visibleNodeIds]);

  const nodesMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Trace active paths if node or transaction selected
  const activeHighlightedTxnIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedTransactionId) {
      set.add(selectedTransactionId);
    }
    if (selectedNodeId) {
      transactions.forEach((t) => {
        if (t.sender_id === selectedNodeId || t.receiver_id === selectedNodeId) {
          set.add(t.transaction_id);
        }
      });
    }
    return set;
  }, [selectedTransactionId, selectedNodeId, transactions]);

  // Selected Node Details
  const activeNode = selectedNodeId ? accountsMap.get(selectedNodeId) : null;
  const activeTxn = selectedTransactionId ? transactionsMap.get(selectedTransactionId) : null;

  const getNodeColor = (role: NodeLayout['role']) => {
    switch (role) {
      case 'victim':
        return {
          bg: '#1e3a8a', // Deep Blue
          border: '#3b82f6',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          title: 'VICTIM SOURCE',
        };
      case 'fraudster':
        return {
          bg: '#881337', // Crimson
          border: '#f43f5e',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          title: 'PHISHING COLLECTOR',
        };
      case 'mule_a':
        return {
          bg: '#7c2d12', // Orange/Brown
          border: '#f97316',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          title: 'MULE LAYER 1 (STUDENT)',
        };
      case 'mule_b':
        return {
          bg: '#701a75', // Purple
          border: '#d946ef',
          badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
          title: 'MULE LAYER 2 (HOMEMAKER)',
        };
      case 'mule_c':
        return {
          bg: '#581c87', // Purple/Violet
          border: '#a855f7',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          title: 'SMURFING AGGREGATOR',
        };
      case 'cashout':
        return {
          bg: '#4c1d95', // Deep Violet
          border: '#8b5cf6',
          badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
          title: 'CASH-OUT OTC SINK',
        };
      case 'corporate':
        return {
          bg: '#0f766e',
          border: '#14b8a6',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          title: 'CORPORATE ESCROW',
        };
      default:
        return {
          bg: '#064e3b',
          border: '#10b981',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          title: 'VERIFIED LEGITIMATE',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Graph Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Interactive Fraud-Chain Graph View</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Directed Multi-Hop Topology
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Nodes represent bank accounts; directed edges represent transaction flows with speed-of-money metrics.
          </p>
        </div>

        {/* View Presets & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setViewPreset('MAIN_CHAIN');
                setSelectedNodeId(null);
              }}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                viewPreset === 'MAIN_CHAIN'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ 4-Hop Rapid Chain
            </button>
            <button
              onClick={() => {
                setViewPreset('COLLECTION_SMURFING');
                setSelectedNodeId(null);
              }}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                viewPreset === 'COLLECTION_SMURFING'
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔄 Smurfing (Many-to-One)
            </button>
            <button
              onClick={() => {
                setViewPreset('FULL_NETWORK');
                setSelectedNodeId(null);
              }}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                viewPreset === 'FULL_NETWORK'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌐 Full Rail ({transactions.length} Txns)
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area + Side Inspector Panel */}
      <div className="flex flex-col lg:flex-row relative min-h-[520px] bg-slate-950 overflow-hidden">
        {/* SVG Graph Canvas */}
        <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center">
          
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Diagram */}
          <div 
            style={{ 
              transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
            className="relative"
          >
            <svg
              width="1080"
              height="500"
              viewBox="0 0 1080 500"
              className="select-none"
            >
              <defs>
                {/* Arrow Markers */}
                <marker
                  id="arrow-fraud"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                </marker>

                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                </marker>

                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
                </marker>

                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* EDGES (Transactions) */}
              {visibleTransactions.map((tx) => {
                const source = nodesMap.get(tx.sender_id);
                const target = nodesMap.get(tx.receiver_id);
                if (!source || !target) return null;

                const isHovered = hoveredEdgeId === tx.transaction_id;
                const isSelected = selectedTransactionId === tx.transaction_id;
                const isHighRisk = tx.label === 'suspicious' || tx.risk_score >= 50;
                const isPathActive = activeHighlightedTxnIds.has(tx.transaction_id);

                // Calculate edge geometry with nice curve if vertical or horizontal offset
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const cx = (source.x + target.x) / 2;
                const cy = (source.y + target.y) / 2 - (dx !== 0 && Math.abs(dy) < 50 ? 25 : 0);

                const strokeColor = isSelected || isHovered
                  ? '#06b6d4'
                  : isHighRisk
                  ? '#f43f5e'
                  : '#334155';

                const markerId = isSelected || isHovered
                  ? 'url(#arrow-active)'
                  : isHighRisk
                  ? 'url(#arrow-fraud)'
                  : 'url(#arrow-normal)';

                return (
                  <g
                    key={tx.transaction_id}
                    className="cursor-pointer transition-all"
                    onClick={() => onSelectTransaction(tx)}
                    onMouseEnter={() => setHoveredEdgeId(tx.transaction_id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                  >
                    {/* Invisible thick path for easy hovering */}
                    <path
                      d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                    />

                    {/* Main transaction edge */}
                    <path
                      d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected || isHovered ? 3.5 : isHighRisk ? 2.5 : 1.5}
                      strokeDasharray={isHighRisk ? '6,4' : undefined}
                      markerEnd={markerId}
                      filter={isHighRisk || isSelected ? 'url(#glow)' : undefined}
                      className={isHighRisk ? 'animate-pulse-subtle' : ''}
                    />

                    {/* Edge Label Pill (Amount + Time) */}
                    <g transform={`translate(${cx}, ${cy - 2})`}>
                      <rect
                        x="-52"
                        y="-12"
                        width="104"
                        height="24"
                        rx="12"
                        fill="#0f172a"
                        stroke={strokeColor}
                        strokeWidth="1.2"
                        className="transition-all"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        ₹{formatINR(tx.amount)}
                      </text>
                    </g>

                    {/* Timing badge if rapid multi-hop */}
                    {tx.rapid_forward_minutes !== undefined && (
                      <g transform={`translate(${cx}, ${cy + 18})`}>
                        <rect
                          x="-38"
                          y="-8"
                          width="76"
                          height="16"
                          rx="8"
                          fill="#7c2d12"
                          stroke="#ea580c"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill="#ffedd5"
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          ⚡ {tx.rapid_forward_minutes}m forward
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* NODES (Accounts) */}
              {nodes.map((node) => {
                const styling = getNodeColor(node.role);
                const isSelected = selectedNodeId === node.id;
                const isLinked = activeHighlightedTxnIds.size > 0 && Array.from(activeHighlightedTxnIds).some((txId) => {
                  const tx = transactionsMap.get(txId);
                  return tx && (tx.sender_id === node.id || tx.receiver_id === node.id);
                });

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  >
                    {/* Selection halo */}
                    {(isSelected || isLinked) && (
                      <circle
                        r="38"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        strokeDasharray="4,3"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    {/* Outer Circle */}
                    <circle
                      r="30"
                      fill={styling.bg}
                      stroke={styling.border}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="url(#glow)"
                    />

                    {/* Icon / Initials */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.account.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </text>

                    {/* Bottom Label Container */}
                    <g transform="translate(0, 42)">
                      {/* Name */}
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="10.5"
                        fontWeight="600"
                        className="drop-shadow"
                      >
                        {node.account.name}
                      </text>

                      {/* Type & KYC Tag */}
                      <text
                        x="0"
                        y="12"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="8.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {node.account.account_type} • {node.account.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Graph Preset Overlay Indicator */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md text-xs shadow-lg max-w-xs">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {viewPreset === 'MAIN_CHAIN' && 'Scenario: 4-Hop Rapid Cashout Chain'}
                {viewPreset === 'COLLECTION_SMURFING' && 'Scenario: Mule Collection (Many-to-One)'}
                {viewPreset === 'FULL_NETWORK' && 'Scenario: Complete Inter-Bank Transaction Mesh'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {viewPreset === 'MAIN_CHAIN' &&
                'Traces stolen funds forwarded from Victim Ramesh to Fraudster, layered through Student & Homemaker mules, and converted via Crypto OTC in 17 minutes total.'}
              {viewPreset === 'COLLECTION_SMURFING' &&
                'Traces multiple small incoming extortion credits into student accounts consolidated before sending to Apex Digital.'}
              {viewPreset === 'FULL_NETWORK' &&
                'Visualizes benign commercial activity alongside fraudulent sub-networks for comprehensive anomaly contrast.'}
            </p>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2 backdrop-blur-md text-[11px] text-slate-300 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-300"></span>
              <span>Victim</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300"></span>
              <span>Fraudster</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300"></span>
              <span>Mule Layer 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 border border-fuchsia-300"></span>
              <span>Mule Layer 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-300"></span>
              <span>Cash-Out Exit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300"></span>
              <span>Legitimate</span>
            </div>
          </div>
        </div>

        {/* SIDE INSPECTOR PANEL: Opens when node or transaction is clicked */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 p-4 flex flex-col justify-between overflow-y-auto max-h-[520px]">
          {activeNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    ACCOUNT DOSSIER
                  </span>
                  <span className="text-xs text-cyan-400 font-mono">{activeNode.id}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{activeNode.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeNode.account_type}
                  </span>
                  <span className="text-xs text-slate-400">Age: {activeNode.account_age}</span>
                </div>
              </div>

              {/* KYC Profile Limits */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  KYC Occupation Profile
                </div>
                <div className="text-xs text-slate-200 font-medium">{activeNode.kyc_occupation}</div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Usual Monthly Credit:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    ₹{formatINR(activeNode.usual_monthly_credit_range[0])} - ₹{formatINR(activeNode.usual_monthly_credit_range[1])}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Ledger Balance:</span>
                  <span className="font-mono text-white font-bold">₹{formatINR(activeNode.current_balance)}</span>
                </div>
              </div>

              {/* Status and Risk */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Risk Classification
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Bank AML Tag:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeNode.risk_status === 'Under Investigation'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : activeNode.risk_status === 'Potential Victim'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeNode.risk_status}
                  </span>
                </div>
                {activeNode.notes && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
                    "{activeNode.notes}"
                  </p>
                )}
              </div>

              {/* Connected Transactions */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Connected Transactions in Stream
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {transactions
                    .filter((t) => t.sender_id === activeNode.id || t.receiver_id === activeNode.id)
                    .map((t) => {
                      const isSender = t.sender_id === activeNode.id;
                      return (
                        <div
                          key={t.transaction_id}
                          onClick={() => onSelectTransaction(t)}
                          className="p-2 rounded bg-slate-950 border border-slate-800/90 hover:border-cyan-500 transition cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono text-cyan-400 text-[11px]">{t.transaction_id}</div>
                            <div className="text-[10px] text-slate-400">
                              {isSender ? `Outgoing to ${t.receiver_id}` : `Incoming from ${t.sender_id}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-white">₹{formatINR(t.amount)}</div>
                            <div className="text-[10px] text-amber-400">{t.risk_score}/100 Risk</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : activeTxn ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    TRANSACTION EDGE DETAILS
                  </span>
                  <span className="text-xs text-cyan-400 font-mono">{activeTxn.transaction_id}</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-white mt-1.5">
                  ₹{formatINR(activeTxn.amount)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {activeTxn.type}
                  </span>
                  <span className="text-xs text-slate-400">{activeTxn.display_time}</span>
                  {activeTxn.rapid_forward_minutes !== undefined && (
                    <span className="text-amber-400 font-bold text-xs">
                      ⚡ Drained in {activeTxn.rapid_forward_minutes}m
                    </span>
                  )}
                </div>
              </div>

              {/* Signals */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Risk Engine Score
                  </span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getRiskBandColor(activeTxn.risk_band).badge}`}>
                    {activeTxn.risk_score} / 100 ({activeTxn.risk_band})
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  {activeTxn.detected_signals.map((sig) => (
                    <div key={sig.code} className="text-xs flex items-center justify-between bg-slate-900/80 p-1.5 rounded">
                      <span className="text-slate-300 truncate max-w-[200px]">{sig.name}</span>
                      <span className="font-mono text-amber-400 font-bold text-[11px]">+{sig.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Mismatch Card */}
              {activeTxn.profile_deviation?.is_mismatch && (
                <div 
                  onClick={() => onOpenProfileMismatch(activeTxn)}
                  className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 hover:border-rose-600 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Trigger 1: Profile Mismatch Detected</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Amount is <strong className="text-white">{activeTxn.profile_deviation.multiplier}x</strong> above the KYC monthly credit ceiling.
                  </p>
                  <span className="text-[11px] text-rose-400 underline underline-offset-2 mt-1 block">
                    Inspect KYC deviation &rarr;
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenCustomerVerification(activeTxn)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Simulate Customer Verification SMS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
              <GitCommit className="w-10 h-10 text-slate-600 mb-2" />
              <h4 className="text-xs font-semibold text-slate-300">Graph Inspector Ready</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Click any account node to inspect KYC profile limits, or click any transaction line to inspect risk signals and rapid money forwarding.
              </p>
            </div>
          )}

          {/* Quick Help Footer */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Graph View: Auto-Layout Engine</span>
            <span>Scale: {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
