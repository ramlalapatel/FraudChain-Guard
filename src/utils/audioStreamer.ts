/**
 * Audio processing utilities for Gemini Live API (gemini-3.8-live)
 * Input: 16kHz raw PCM Little-Endian
 * Output: 24kHz raw PCM Little-Endian
 */

/**
 * Converts Float32Array from Web Audio API into 16-bit linear PCM base64 string
 */
export function floatTo16BitPCM(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    // 16-bit signed integer range: -32768 to 32767
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  
  // Convert buffer to binary string then base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts base64 PCM string (24kHz from model) into an AudioBuffer for playback
 */
export function base64ToAudioBuffer(
  audioCtx: AudioContext,
  base64Data: string,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const numSamples = bytes.length / 2;
  const audioBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    channelData[i] = int16 / 32768.0;
  }

  return audioBuffer;
}

/**
 * Audio Queue Player for gapless audio playback
 */
export class GaplessAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {
    // Lazily initialized upon user interaction
  }

  public init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunk(base64Chunk: string) {
    this.init();
    if (!this.audioCtx) return;

    try {
      const buffer = base64ToAudioBuffer(this.audioCtx, base64Chunk, 24000);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);

      const currentTime = this.audioCtx.currentTime;
      // If nextStartTime is in the past, reset to now
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  }

  public stopAll() {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public close() {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
