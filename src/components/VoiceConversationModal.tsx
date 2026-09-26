import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  Send, 
  RotateCcw,
  Activity,
  PhoneCall,
  PhoneOff
} from 'lucide-react';
import { floatTo16BitPCM, GaplessAudioPlayer } from '../utils/audioStreamer';

interface VoiceTranscriptItem {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakingModel, setIsSpeakingModel] = useState<boolean>(false);
  const [isSpeakingUser, setIsSpeakingUser] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([
    {
      id: 'init-live',
      sender: 'model',
      text: 'Voice link initialized with gemini-3.8-live. Speak into your microphone to discuss suspicious transactions, mule account detection, or rapid money chains in real time.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [textFallback, setTextFallback] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<GaplessAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Clean up audio on unmount or close
  useEffect(() => {
    if (!isOpen) {
      disconnectLive();
    }
  }, [isOpen]);

  const connectLive = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // 1. Initialize Audio Player for 24kHz model output
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new GaplessAudioPlayer();
      }
      audioPlayerRef.current.init();

      // 2. Establish WebSocket connection to backend Live API proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[Live Client] WebSocket connected to /api/live');
        setIsConnected(true);
        setIsConnecting(false);

        // 3. Request mic access and start capturing 16kHz PCM
        try {
          await startMicCapture();
        } catch (micErr: any) {
          console.warn('[Live Client] Mic permission error, text fallback available:', micErr);
          setConnectionError('Microphone permission not granted. You can still speak via text input below.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            setIsSpeakingModel(true);
            audioPlayerRef.current?.playChunk(data.audio);
          } else if (data.type === 'transcript_model' && data.text) {
            setTranscripts((prev) => {
              // Append to last model item if recent or create new
              const last = prev[prev.length - 1];
              if (last && last.sender === 'model') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: `${last.text} ${data.text}`.trim() },
                ];
              }
              return [
                ...prev,
                {
                  id: `tr-${Date.now()}`,
                  sender: 'model',
                  text: data.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          } else if (data.type === 'transcript_user' && data.text) {
            setTranscripts((prev) => [
              ...prev,
              {
                id: `tr-${Date.now()}`,
                sender: 'user',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          } else if (data.type === 'interrupted') {
            audioPlayerRef.current?.stopAll();
            setIsSpeakingModel(false);
          } else if (data.type === 'turn_complete') {
            setIsSpeakingModel(false);
          } else if (data.type === 'error') {
            setConnectionError(data.error);
          }
        } catch (err) {
          console.error('[Live Client] Message parsing error:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live Client] WebSocket error:', err);
        setConnectionError('Live session disconnected. Ensure server is active.');
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        stopMicCapture();
      };
    } catch (err: any) {
      console.error('[Live Client] Connection setup error:', err);
      setConnectionError(err?.message || 'Could not connect to Live API.');
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const startMicCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    micStreamRef.current = stream;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const inputCtx = new AudioCtx({ sampleRate: 16000 });
    inputAudioCtxRef.current = inputCtx;

    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(inputCtx.destination);

    processor.onaudioprocess = (e) => {
      if (isMicMuted) return;

      const channelData = e.inputBuffer.getChannelData(0);
      
      // Calculate simple RMS volume level for activity indicator
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);
      setIsSpeakingUser(rms > 0.02);

      // Convert Float32 to 16-bit linear PCM base64 string
      const base64Pcm = floatTo16BitPCM(channelData);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Pcm,
          })
        );
      }
    };
  };

  const stopMicCapture = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setIsSpeakingUser(false);
  };

  const disconnectLive = () => {
    stopMicCapture();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAll();
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeakingModel(false);
  };

  const handleSendTextFallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textFallback.trim()) return;

    const query = textFallback.trim();
    setTextFallback('');

    // Add user message to transcript
    setTranscripts((prev) => [
      ...prev,
      {
        id: `tr-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: query,
        })
      );
    } else {
      // Connect first then send
      connectLive().then(() => {
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'text', text: query }));
          }
        }, 500);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/40">
              <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse text-cyan-200' : 'text-slate-300'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Live Voice AML Investigator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bidirectional real-time voice streaming with Gemini Live API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Banner */}
        <div className="p-6 bg-slate-950/90 border-b border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle glowing ring indicator */}
          <div className="relative flex items-center justify-center">
            {isConnected && (
              <div 
                className={`absolute w-32 h-32 rounded-full border-2 transition-all duration-300 ${
                  isSpeakingModel
                    ? 'border-cyan-400 scale-125 animate-ping opacity-30'
                    : isSpeakingUser
                    ? 'border-emerald-400 scale-110 animate-pulse opacity-40'
                    : 'border-slate-700 opacity-20'
                }`}
              />
            )}

            <button
              onClick={isConnected ? disconnectLive : connectLive}
              disabled={isConnecting}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl ${
                isConnected
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-900/50 ring-4 ring-cyan-500/20 hover:scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isConnecting ? (
                <Activity className="w-7 h-7 animate-spin text-cyan-300" />
              ) : isConnected ? (
                <PhoneOff className="w-7 h-7 text-white" />
              ) : (
                <PhoneCall className="w-7 h-7 text-cyan-400" />
              )}
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                {isConnecting ? 'Linking...' : isConnected ? 'End Call' : 'Start Voice'}
              </span>
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`} />
              <span className="text-xs font-semibold text-white">
                {isConnected
                  ? isSpeakingModel
                    ? 'Gemini Live is speaking (Voice: Zephyr)...'
                    : isSpeakingUser
                    ? 'Listening to your voice...'
                    : 'Voice connection active — speak anytime'
                  : 'Voice session offline — click to establish real-time link'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              16kHz PCM Linear Audio Input • 24kHz Gapless Audio Output
            </p>
          </div>

          {/* Controls toolbar */}
          {isConnected && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                  isMicMuted
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isMicMuted ? 'Mic Muted' : 'Mic Active'}</span>
              </button>

              <button
                onClick={() => audioPlayerRef.current?.stopAll()}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Interrupt audio playback"
              >
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>Interrupt Speech</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {connectionError && (
          <div className="p-3 bg-rose-950/40 border-b border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{connectionError}</span>
          </div>
        )}

        {/* Real-time Voice Transcripts Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60 max-h-64">
          {transcripts.map((t) => {
            const isUser = t.sender === 'user';
            return (
              <div
                key={t.id}
                className={`flex flex-col text-xs ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                  <span className={isUser ? 'text-blue-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                    {isUser ? 'You (Voice)' : 'Gemini 3.8 Live (Zephyr)'}
                  </span>
                  <span>• {t.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    isUser
                      ? 'bg-blue-600/90 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {t.text}
                </div>
              </div>
            );
          })}
          <div ref={transcriptsEndRef} />
        </div>

        {/* Text Fallback & Quick Audio Prompts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          <form onSubmit={handleSendTextFallback} className="flex gap-2">
            <input
              type="text"
              value={textFallback}
              onChange={(e) => setTextFallback(e.target.value)}
              placeholder="Or speak via text query (e.g. 'Explain the 4-hop mule chain')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-cyan-900/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Direct Live API Session with Google GenAI SDK (`gemini-3.8-live`)</span>
            <button
              onClick={() => setTranscripts([])}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Clear Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
