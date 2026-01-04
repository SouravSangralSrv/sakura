
import React, { useState, useRef } from 'react';
import { VoiceProfile } from '../types';

interface VoiceClonerProps {
  profiles: VoiceProfile[];
  activeVoiceId: string;
  onSelectVoice: (id: string) => void;
  onAddProfile: (profile: VoiceProfile) => void;
  onDeleteProfile: (id: string) => void;
}

const VoiceCloner: React.FC<VoiceClonerProps> = ({ 
  profiles, 
  activeVoiceId, 
  onSelectVoice, 
  onAddProfile,
  onDeleteProfile 
}) => {
  const [isCloning, setIsCloning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert("Please upload an audio file.");
      return;
    }

    setIsCloning(true);
    
    // Simulate Neural Analysis via Gemini
    // In a real scenario, we'd send the audio to Gemini 1.5 Pro to describe the voice
    setTimeout(() => {
      const newProfile: VoiceProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Cloned: ${file.name.split('.')[0]}`,
        description: "Warm, slightly high-pitched voice with a gentle Indian accent. Calibrated with clear articulation and melodic rhythm.",
        sampleUrl: URL.createObjectURL(file),
        isCustom: true
      };
      onAddProfile(newProfile);
      onSelectVoice(newProfile.id);
      setIsCloning(false);
    }, 3000);
  };

  return (
    <div className="buddy-glass p-5 border border-white/5 flex flex-col gap-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
          Voice Cloning Lab
        </h3>
        {isCloning && <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {profiles.map(profile => (
          <div 
            key={profile.id}
            onClick={() => onSelectVoice(profile.id)}
            className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              activeVoiceId === profile.id 
                ? 'bg-cyan-500/10 border-cyan-500/40' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeVoiceId === profile.id ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white/40'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/80">{profile.name}</span>
                <span className="text-[7px] uppercase tracking-widest text-white/20">{profile.isCustom ? 'Neural Clone' : 'Native Core'}</span>
              </div>
            </div>
            {profile.isCustom && (
               <button 
                onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/10 hover:text-red-500 transition-all"
               >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            )}
          </div>
        ))}
      </div>

      <div 
        className={`relative h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
          dragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 hover:border-white/20'
        } ${isCloning ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <svg className="w-5 h-5 text-white/20 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
        <span className="text-[9px] font-bold text-white/30 uppercase">Upload Voice Sample</span>
        
        {isCloning && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
             <div className="flex gap-1">
                <div className="w-1 h-6 bg-cyan-400 animate-[bounce_0.6s_infinite]"></div>
                <div className="w-1 h-8 bg-cyan-400 animate-[bounce_0.6s_infinite_0.1s]"></div>
                <div className="w-1 h-4 bg-cyan-400 animate-[bounce_0.6s_infinite_0.2s]"></div>
                <div className="w-1 h-10 bg-cyan-400 animate-[bounce_0.6s_infinite_0.3s]"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCloner;
