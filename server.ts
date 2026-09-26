import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `You are FraudChain Guard AML Copilot — a Senior Financial Crimes & Anti-Money Laundering (AML) Investigator at a major bank.
You specialize in detecting mule account syndicates, multi-hop layering graphs, rapid money drain schemes, and KYC profile anomalies.
You understand Indian and global regulatory frameworks including:
- 1930 National Cyber Crime Reporting Portal (NCRP) victim reporting
- FIU-IND Suspicious Activity Reports (SAR)
- RBI Master Directions on KYC, PMLA, and Corporate Account Scrutiny mandates
- Transaction velocity (draining >90% of funds within 15 minutes of inward credit)
- Additive risk score formulas (+30 sender suspicious, +30 linked to suspicious, +40 customer denies, +20 profile mismatch, +20 rapid multihop, +10 new sender, +5 unusual time)

When answering analysts or investigators:
1. Be rigorous, analytical, concise, and structured.
2. Quote exact transaction IDs, amounts in INR (₹), counterparty roles (e.g. Victim Source, Mule Layer 1, Mule Layer 2, Cash-Out Sink), and score points.
3. Suggest concrete actions (e.g., dispatch SMS evidence request, initiate nodal freeze advisory, report to Cyber Police).`;

// --- REST Endpoint: Multi-Turn Chat ---
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.5-flash', contextData } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Model selection based on user requirements:
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    const selectedModel = model || 'gemini-3.5-flash';

    let dynamicSystemPrompt = DEFAULT_SYSTEM_INSTRUCTION;
    if (contextData) {
      dynamicSystemPrompt += `\n\nCURRENT LIVE BANK TELEMETRY CONTEXT:\n${JSON.stringify(contextData, null, 2)}`;
    }

    // Format conversation history for multi-turn chat
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: dynamicSystemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'No response generated.';
    return res.json({
      reply,
      modelUsed: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error?.message || 'Gemini API invocation failed';
    return res.status(500).json({
      error: errorMessage,
      details: error?.status || 'INTERNAL_ERROR',
    });
  }
});

// --- REST Endpoint: Automated Forensic Case Analysis ---
app.post('/api/analyze-case', async (req: Request, res: Response) => {
  try {
    const { transaction, sender, receiver } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction object required' });
    }

    const prompt = `Conduct a forensic AML assessment for Transaction ${transaction.transaction_id}:
- Amount: ₹${transaction.amount} via ${transaction.type} at ${transaction.display_time}
- Sender: ${sender?.name || transaction.sender_id} (${sender?.account_type || 'Unknown'}, Status: ${sender?.risk_status || 'Normal'})
- Receiver: ${receiver?.name || transaction.receiver_id} (${receiver?.account_type || 'Unknown'}, KYC: ${receiver?.kyc_occupation || 'Unknown'}, Monthly Ceiling: ₹${receiver?.usual_monthly_credit_range?.[1] || 'N/A'})
- Active Signals: ${(transaction.detected_signals || []).map((s: any) => `${s.name} (+${s.points})`).join(', ')}
- Current Score: ${transaction.risk_score}/100 (${transaction.risk_band})
- Rapid Forwarding: ${transaction.rapid_forward_minutes ? `${transaction.rapid_forward_minutes} minutes` : 'None'}
${transaction.complaint ? `- Cyber Complaint: ${transaction.complaint.portal_ref} (${transaction.complaint.category})` : ''}

Provide a 3-point briefing:
1. Primary Threat Signature (Mule Ring, Phishing Inflow, Smurfing, or Legitimate)
2. Regulatory Risk & Legal Liability
3. Recommended Immediate Action for the AML Desk`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return res.json({
      analysis: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-case:', error);
    return res.status(500).json({ error: error?.message || 'Forensic analysis failed' });
  }
});

// --- WebSocket Server: Gemini 3.8 Live API Voice & Real-Time Audio Streaming ---
const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to WebSocket');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Zephyr', // Clear, authoritative investigator voice
            },
          },
        },
        systemInstruction: `You are the voice assistant for FraudChain Guard, an intelligent transaction risk and fraud-chain detection system used by bank AML analysts.
You speak clearly, concisely, and authoritatively like an experienced senior financial crimes detective.
You discuss flagged transactions, 4-hop mule chains, profile mismatches, 1930 cyber complaints, and rapid forwarding in real time.
Keep spoken responses brief (1-3 sentences) so the conversation flows naturally.`,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // Audio output from model
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // Model transcript if available
          const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text);
          if (textPart?.text) {
            clientWs.send(JSON.stringify({ type: 'transcript_model', text: textPart.text }));
          }

          // Output audio transcription
          const outputTranscript = (message.serverContent as any)?.outputAudioTranscription?.text;
          if (outputTranscript) {
            clientWs.send(JSON.stringify({ type: 'transcript_model', text: outputTranscript }));
          }

          // Input audio transcription (user)
          const inputTranscript = (message.serverContent as any)?.inputAudioTranscription?.text;
          if (inputTranscript) {
            clientWs.send(JSON.stringify({ type: 'transcript_user', text: inputTranscript }));
          }

          // Interruption event
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
          }

          // Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turn_complete' }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'session_closed' }));
          }
        },
        onerror: (err: any) => {
          console.error('[Live API] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'connected', message: 'Connected to Gemini Live (gemini-3.8-live)' }));

    // Handle messages from client
    clientWs.on('message', async (data: any) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'audio' && payload.audio && session) {
          // Send raw PCM audio 16kHz to Live session
          await session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.type === 'text' && payload.text && session) {
          // Send text input to Live session
          await session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err: any) {
        console.error('[Live API] Error processing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      if (session && typeof session.close === 'function') {
        session.close();
      }
    });
  } catch (err: any) {
    console.error('[Live API] Failed to establish live connection:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        error: err?.message || 'Failed to initialize gemini-3.8-live connection',
      })
    );
    clientWs.close();
  }
});

// Vite Middleware for Dev / Static files for Prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[FraudChain Guard] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
