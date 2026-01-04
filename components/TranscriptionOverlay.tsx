
import React, { useEffect, useRef } from 'react';
import { TranscriptionItem } from '../types';

interface Props {
  history: TranscriptionItem[];
  currentInput: string;
  currentOutput: string;
}

const TypingIndicator: React.FC = () => (
  <span className="inline-flex items-center ml-2 h-3 opacity-60">
    <span className="typing-dot bg-cyan-400"></span>
    <span className="typing-dot bg-cyan-400" style={{ animationDelay: '0.2s' }}></span>
    <span className="typing-dot bg-cyan-400" style={{ animationDelay: '0.4s' }}></span>
  </span>
);

const TranscriptionOverlay: React.FC<Props> = ({ history, currentInput, currentOutput }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentInput, currentOutput]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar" ref={scrollRef}>
      {history.map((item, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`}
        >
          <div className={`max-w-[90%] px-6 py-4 rounded-[24px] text-sm leading-relaxed shadow-lg ${
            item.sender === 'user' 
              ? 'bg-white/10 text-white/90 border border-white/10 rounded-tr-none' 
              : 'buddy-glass border-white/20 text-white rounded-tl-none ring-1 ring-white/5'
          }`}>
            <p className="whitespace-pre-wrap">{item.text}</p>
            {item.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-white/20 shadow-2xl group relative">
                <img src={item.imageUrl} alt="Generated Art" className="w-full h-auto object-cover max-h-72 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Digital Rendering</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              {item.sender === 'user' ? 'Local Entry' : 'Neural Echo'}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
            <span className="text-[9px] font-mono text-white/10">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      
      {(currentInput || currentOutput) && (
        <div className={`flex flex-col ${currentInput ? 'items-end' : 'items-start'} animate-in fade-in duration-700`}>
          <div className={`max-w-[90%] px-6 py-4 rounded-[24px] text-sm ${
            currentInput 
              ? 'bg-white/5 text-white/30 italic border border-white/5' 
              : 'buddy-glass text-cyan-50/90 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] rounded-tl-none'
          }`}>
            <span className="relative">
               {currentInput || currentOutput}
               {currentOutput && <TypingIndicator />}
            </span>
          </div>
        </div>
      )}

      {history.length === 0 && !currentInput && !currentOutput && (
        <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 opacity-30">
           <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/40 rounded-full animate-pulse"></div>
           </div>
           <p className="text-[10px] text-white uppercase tracking-[0.8em] text-center px-10 font-black">
             System Idle
           </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionOverlay;
