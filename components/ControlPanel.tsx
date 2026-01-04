
import React from 'react';
import { Gender, VTuberState, LLMProvider } from '../types';

interface ControlPanelProps {
  isActive: boolean;
  onToggle: () => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  isConnecting: boolean;
  vtuberState: VTuberState;
  setVtuberState: React.Dispatch<React.SetStateAction<VTuberState>>;
  // Keeping interface compatible with existing props if needed
  language?: any;
  setLanguage?: any;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isActive, 
  onToggle, 
  gender,
  setGender,
  isConnecting,
  vtuberState,
  setVtuberState
}) => {
  return (
    <div className="buddy-glass p-5 flex flex-col gap-6 shadow-2xl relative overflow-hidden border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Core Config</h3>
        </div>
        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/20'}`}>
          {isActive ? 'Synced' : 'Offline'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Engine Toggle */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Cognitive Engine</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            {[LLMProvider.GEMINI, LLMProvider.OLLAMA].map(p => (
              <button
                key={p}
                onClick={() => setVtuberState(prev => ({ ...prev, provider: p }))}
                disabled={isActive}
                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  vtuberState.provider === p ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5'
                } ${isActive ? 'opacity-50' : ''}`}
              >
                {p === LLMProvider.GEMINI ? 'Cloud' : 'Local'}
              </button>
            ))}
          </div>
        </div>

        {/* Character Select */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Persona</label>
          <div className="grid grid-cols-2 gap-2">
            {[Gender.FEMALE, Gender.MALE].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                disabled={isActive}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  gender === g 
                  ? (g === Gender.FEMALE ? 'bg-pink-500/10 border-pink-500/40 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400') 
                  : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'
                } ${isActive ? 'opacity-50' : ''}`}
              >
                {g === Gender.FEMALE ? 'Sakura' : 'Haruki'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onToggle}
        disabled={isConnecting}
        className={`mt-2 w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${
          isActive 
            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 shadow-lg' 
            : 'bg-white text-black hover:bg-white/90 shadow-xl scale-100 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isConnecting ? 'Connecting...' : isActive ? 'Terminate' : 'Initiate Buddy'}
      </button>
    </div>
  );
};

export default ControlPanel;
