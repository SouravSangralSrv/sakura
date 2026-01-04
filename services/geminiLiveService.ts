
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type } from '@google/genai';
import { DESKTOP_TOOLS } from '../constants';

export interface LiveSessionCallbacks {
  onAudioData: (base64: string) => void;
  onInterrupted: () => void;
  onTranscriptionUpdate: (type: 'user' | 'vtuber', text: string, isFinal: boolean, imageUrl?: string) => void;
  onToolCall: (name: string, args: any, id: string) => Promise<any> | any;
  onOpen: () => void;
  onClose: () => void;
  onerror: (err: any) => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  public sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(systemInstruction: string, callbacks: LiveSessionCallbacks, voiceName: string = 'Kore') {
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: async () => {
          callbacks.onOpen();
          if (this.sessionPromise) {
            await this.startMicStream(this.sessionPromise);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Function/Tool Calls
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              const result = await callbacks.onToolCall(fc.name, fc.args, fc.id);
              this.sessionPromise?.then(session => {
                session.sendToolResponse({
                  functionResponses: [{
                    id: fc.id,
                    name: fc.name,
                    response: { result: result || "ok" },
                  }]
                });
              });
            }
          }

          // Handle Audio Data
          const audioPart = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
          if (audioPart?.inlineData?.data) {
            callbacks.onAudioData(audioPart.inlineData.data);
          }

          // Handle Image Parts (Art Studio Feature)
          const imagePart = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'));
          if (imagePart?.inlineData?.data) {
             const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
             callbacks.onTranscriptionUpdate('vtuber', '', false, imageUrl);
          }
          
          if (message.serverContent?.interrupted) {
            callbacks.onInterrupted();
          }
          
          if (message.serverContent?.inputTranscription) {
            callbacks.onTranscriptionUpdate('user', message.serverContent.inputTranscription.text, false);
          }
          
          if (message.serverContent?.outputTranscription) {
            callbacks.onTranscriptionUpdate('vtuber', message.serverContent.outputTranscription.text, false);
          }
          
          if (message.serverContent?.turnComplete) {
            callbacks.onTranscriptionUpdate('vtuber', '', true);
          }
        },
        onerror: (e) => callbacks.onerror(e),
        onclose: () => callbacks.onClose(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        tools: DESKTOP_TOOLS as any,
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });

    return await this.sessionPromise;
  }

  async sendTextMessage(text: string) {
    if (!this.sessionPromise) return;
    const session = await this.sessionPromise;
    if (session) {
      session.sendRealtimeInput({
        parts: [{ text }]
      });
    }
  }

  private async startMicStream(sessionPromise: Promise<any>) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);
      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = this.createBlob(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  disconnect() {
    if (this.sessionPromise) {
      this.sessionPromise.then(s => s.close());
      this.sessionPromise = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  static async decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  }
}
