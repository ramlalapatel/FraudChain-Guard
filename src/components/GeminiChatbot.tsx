import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  ShieldAlert, 
  Check, 
  Copy, 
  Cpu, 
  User, 
  X, 
  Maximize2, 
  Minimize2, 
  MessageSquare
} from 'lucide-react';
import { Account, Transaction } from '../types';
import { formatINR } from '../utils/riskEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  onSelectTransaction,
}) => {
  // Model selection per user prompt instructions:
  // - gemini-3.1-pro-preview for particularly complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      role: 'model',
      content: `Hello, Investigator. I am your **FraudChain Guard AML Copilot**.

I have full real-time awareness of our active ledger (${transactions.length} transactions monitored, ${transactions.filter(t => t.label === 'suspicious').length} flagged) and mule network topology.

How can I assist your investigation today?
• Ask me to analyze the **4-hop rapid forwarding chain**
• Query **Profile Mismatch thresholds** on student or homemaker accounts
• Review **1930 Cyber Cell complaints** and corporate scrutiny requirements
• Formulate a **Suspicious Activity Report (SAR)** draft`,
      modelUsed: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Build high-density context snapshot to ground model with ground truth
  const prepareContextData = () => {
    return {
      totalMonitoredVolume: transactions.reduce((acc, t) => acc + t.amount, 0),
      flaggedCount: transactions.filter((t) => t.label === 'suspicious').length,
      activeMuleChain: transactions
        .filter((t) => t.is_fraud_chain_part)
        .map((t) => ({
          txnId: t.transaction_id,
          sender: t.sender_id,
          receiver: t.receiver_id,
          amount: t.amount,
          role: t.chain_role,
          forwardMinutes: t.rapid_forward_minutes,
          score: t.risk_score,
          signals: t.signals,
        })),
      accountsSummary: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.account_type,
        occupation: a.kyc_occupation,
        usualRange: a.usual_monthly_credit_range,
        status: a.risk_status,
      })),
      recentComplaints: transactions
        .filter((t) => t.complaint)
        .map((t) => ({
          txnId: t.transaction_id,
          ref: t.complaint?.portal_ref,
          category: t.complaint?.category,
          division: t.complaint?.cyber_cell_division,
        })),
    };
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update local state with user message
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send entire conversation history for true multi-turn chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          contextData: prepareContextData(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        content: data.reply,
        modelUsed: data.modelUsed || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Investigation Query Notice**: Unable to generate response. ${err?.message || 'Check server connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: 'Session refreshed. Ready for next AML intelligence briefing.',
        modelUsed: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    'Trace the 4-hop money chain from Ramesh to Crypto exit',
    'Why was student Aarav Sharma flagged for Profile Mismatch?',
    'What are the legal compliance steps for Nexus Logistics?',
    'Explain how the +40 Customer Denial score signal functions',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div
        className={`bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-full md:w-3/4 lg:w-3/5' : 'w-full sm:w-[500px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-900/40 border border-cyan-400/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  AML Intelligence Copilot
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GEMINI AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-turn reasoning on transaction ledger & mule syndicates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer hidden sm:block"
              title={isExpanded ? 'Collapse' : 'Expand Width'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Selection Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Model:</span>
          </div>

          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.5-flash: Best for general AML tasks"
            >
              gemini-3.5-flash <span className="opacity-70 font-normal">(General)</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.1-pro-preview: Deep forensic reasoning & complex tasks"
            >
              gemini-3.1-pro <span className="opacity-70 font-normal">(Complex)</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="gemini-3.1-flash-lite: Low-latency fast responses"
            >
              flash-lite <span className="opacity-70 font-normal">(Fast)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm space-y-1.5 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Model & Timestamp header */}
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono pb-1 border-b border-white/10">
                    <span className={isUser ? 'text-blue-200' : 'text-cyan-400'}>
                      {isUser ? 'Investigator' : `Copilot (${msg.modelUsed || selectedModel})`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white transition cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content rendered nicely */}
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed space-y-2">
                    {msg.content}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs items-center text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Copilot is reasoning over bank transaction records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Suggested:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Copilot about any account, mule pattern, or case..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-cyan-900/40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
            <span>Role: Chief Financial Crimes Analyst (PMLA & RBI AML Grounded)</span>
            <span>Model: {selectedModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
