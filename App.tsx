
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Avatar from './components/Avatar';
import ControlPanel from './components/ControlPanel';
import TranscriptionOverlay from './components/TranscriptionOverlay';
import KnowledgeBase from './components/KnowledgeBase';
import { GeminiLiveService } from './services/geminiLiveService';
import { OllamaService } from './services/ollamaService';
import { FileSystemService } from './services/fileSystemService';
import { VTuberState, TranscriptionItem, Gender, DocumentItem, LLMProvider } from './types';
import { getSystemInstruction } from './constants';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [vtuberState, setVtuberState] = useState<VTuberState>({ 
    isSpeaking: false, 
    isListening: false, 
    emotion: 'idle',
    provider: LLMProvider.GEMINI
  });
  
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  const currentOutputRef = useRef('');
  const liveService = useRef<GeminiLiveService | null>(null);
  const ollamaService = useRef<OllamaService | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    liveService.current = new GeminiLiveService();
    ollamaService.current = new OllamaService();
    outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
      liveService.current?.disconnect();
      outputAudioContext.current?.close();
    };
  }, []);

  const handleAudioData = useCallback(async (base64: string) => {
    if (!outputAudioContext.current) return;
    const ctx = outputAudioContext.current;
    const audioBuffer = await GeminiLiveService.decodeAudioData(base64, ctx);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    const startAt = Math.max(now, nextStartTime.current);
    source.start(startAt);
    nextStartTime.current = startAt + audioBuffer.duration;
    activeSources.current.add(source);
    setVtuberState(prev => ({ ...prev, isSpeaking: true }));
    source.onended = () => {
      activeSources.current.delete(source);
      if (activeSources.current.size === 0) setVtuberState(prev => ({ ...prev, isSpeaking: false, emotion: 'idle' }));
    };
  }, []);

  const toggleSession = async () => {
    if (isActive) {
      if (vtuberState.provider === LLMProvider.GEMINI) {
        liveService.current?.disconnect();
      }
      setIsActive(false);
      return;
    }

    setIsConnecting(true);

    if (vtuberState.provider === LLMProvider.OLLAMA) {
      const isRunning = await ollamaService.current?.checkConnection();
      if (!isRunning) {
        alert("Ollama is not running. Please start it on port 11434.");
        setIsConnecting(false);
        return;
      }
      setIsActive(true);
      setIsConnecting(false);
      setVtuberState(p => ({ ...p, isListening: true }));
      return;
    }

    const instruction = getSystemInstruction(
      gender, 
      documents.filter(d=>d.isActive).map(d=>d.content).join('\n')
    );

    try {
      const voiceName = gender === Gender.FEMALE ? 'Kore' : 'Puck';
      await liveService.current?.connect(instruction, {
        onOpen: () => { 
          setIsActive(true); 
          setIsConnecting(false); 
          setVtuberState(p=>({...p, isListening:true})); 
        },
        onClose: () => { setIsActive(false); setIsConnecting(false); },
        onerror: () => setIsConnecting(false),
        onAudioData: handleAudioData,
        onInterrupted: () => { activeSources.current.forEach(s=>s.stop()); activeSources.current.clear(); nextStartTime.current=0; setVtuberState(p=>({...p, isSpeaking:false})); },
        onToolCall: async (name, args) => {
          console.log(`Executing tool: ${name}`, args);
          switch(name) {
            case 'openBrowser':
              return FileSystemService.openBrowser(args.url);
            case 'openFile':
              return FileSystemService.openFile(args.filePath);
            case 'listFiles':
              return FileSystemService.listFiles(args.dirPath);
            case 'readFile':
              return FileSystemService.readFile(args.filePath);
            default:
              return "Tool not recognized.";
          }
        },
        onTranscriptionUpdate: (type, text, isFinal) => {
          if (type === 'user') {
            if (isFinal) {
              setHistory(prev => [...prev, { sender: 'user', text, timestamp: Date.now() }]);
              setCurrentInput('');
            } else {
              setCurrentInput(text);
            }
          } else {
            if (isFinal) {
              setHistory(prev => [...prev, { sender: 'vtuber', text: currentOutputRef.current, timestamp: Date.now() }]);
              currentOutputRef.current = '';
              setCurrentOutput('');
            } else {
              currentOutputRef.current += text;
              setCurrentOutput(currentOutputRef.current);
              setVtuberState(p=>({...p, emotion: 'talking'}));
            }
          }
        }
      }, voiceName);
    } catch (e) { setIsConnecting(false); }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 drag-region h-screen relative z-10 overflow-hidden">
      {/* Configuration Sidebar */}
      <aside className="w-full md:w-72 flex flex-col gap-4 z-20 no-drag h-full">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl shadow-lg">VB</div>
          <h1 className="text-sm font-black tracking-widest uppercase">V-Bharat</h1>
        </div>

        <ControlPanel 
          isActive={isActive} isConnecting={isConnecting} onToggle={() => toggleSession()} 
          gender={gender} setGender={setGender}
          vtuberState={vtuberState} setVtuberState={setVtuberState}
        />

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
           <KnowledgeBase 
             documents={documents} 
             onAddDocument={d=>setDocuments(p=>[...p,d])} 
             onRemoveDocument={id=>setDocuments(p=>p.filter(d=>d.id!==id))} 
             onToggleDocument={id=>setDocuments(p=>p.map(d=>d.id===id?{...d,isActive:!d.isActive}:d))} 
           />
        </div>
      </aside>

      {/* Main Interactive Avatar */}
      <main className="flex-1 flex items-center justify-center relative no-drag">
        <Avatar state={vtuberState} gender={gender} />
        <div className="absolute top-4 right-4 buddy-glass px-3 py-1.5 flex items-center gap-2 border-white/5 opacity-50">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-white/10'}`}></div>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
            {vtuberState.provider === LLMProvider.GEMINI ? 'Cloud' : 'Edge'} Ready
          </span>
        </div>
      </main>

      {/* Live Transcription Panel (Text input removed) */}
      <aside className="w-full md:w-[400px] flex flex-col buddy-glass shadow-2xl z-20 border-white/5 overflow-hidden no-drag h-full">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Live Transcription</h2>
          {isActive && (
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-cyan-500/40 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-cyan-500/60 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1 h-3 bg-cyan-500/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          )}
        </div>
        <TranscriptionOverlay history={history} currentInput={currentInput} currentOutput={currentOutput} />
      </aside>
    </div>
  );
};

export default App;
