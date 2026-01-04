
import React, { useMemo } from 'react';
import { VTuberState, Gender } from '../types';

interface AvatarProps {
  state: VTuberState;
  gender: Gender;
  modelUrl?: string;
}

const Avatar: React.FC<AvatarProps> = ({ state, gender, modelUrl }) => {
  const SAKURA_2D = "https://images3.alphacoders.com/106/thumb-1920-1069235.jpg";
  const HARUKI_2D = "https://images.alphacoders.com/137/thumb-1920-1373558.png";

  const activeImage = modelUrl || (gender === Gender.FEMALE ? SAKURA_2D : HARUKI_2D);

  // Aura colors based on emotion
  const auraColor = useMemo(() => {
    switch (state.emotion) {
      case 'happy': return 'from-pink-500/40 via-purple-500/20 to-transparent';
      case 'thinking': return 'from-cyan-400/40 via-blue-500/20 to-transparent';
      case 'talking': return 'from-amber-400/40 via-orange-500/20 to-transparent';
      case 'surprised': return 'from-yellow-300/40 via-white/20 to-transparent';
      default: return 'from-white/10 via-white/5 to-transparent';
    }
  }, [state.emotion]);

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {/* Background Holographic Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Sound Waves */}
         {state.isSpeaking && (
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] flex items-center justify-center">
             <div className="wave-ring w-full h-full border-white/10" style={{ animationDelay: '0s' }}></div>
             <div className="wave-ring w-full h-full border-cyan-500/20" style={{ animationDelay: '0.6s' }}></div>
             <div className="wave-ring w-full h-full border-pink-500/20" style={{ animationDelay: '1.2s' }}></div>
           </div>
         )}
         
         {/* Particles */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center p-8">
        {/* Dynamic Emotion Aura */}
        <div className={`absolute w-[550px] h-[550px] rounded-full bg-gradient-to-tr blur-[120px] transition-all duration-1000 ${auraColor} ${
          state.isSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-60'
        }`}></div>

        <div className={`relative transition-all duration-700 ease-out transform flex flex-col items-center ${
          state.isSpeaking ? 'scale-105 -translate-y-4' : 'scale-100'
        }`}>
          {/* HUD Brackets - Holographic Detail */}
          <div className="absolute -inset-10 pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"></div>
          </div>

          <div className="relative group">
            <img 
              src={activeImage} 
              alt="V-Bharat Avatar" 
              className={`w-auto h-[65vh] object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[40px] border-2 border-white/10 transition-all duration-1000 ${
                state.isSpeaking ? 'animate-[bounce_0.4s_infinite]' : 'animate-[float_8s_infinite_ease-in-out]'
              }`}
              style={{
                filter: state.isSpeaking ? 'brightness(1.1) saturate(1.2)' : 'brightness(0.95)'
              }}
            />
            
            {/* Holographic Scan Overlay */}
            {state.isListening && (
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-[10%] w-full animate-[scanline_2s_linear_infinite] pointer-events-none"></div>
            )}

            {state.isSpeaking && (
               <div className="absolute -inset-4 rounded-[45px] ring-2 ring-white/20 animate-pulse pointer-events-none shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
            )}
          </div>

          {/* Persona Badge */}
          <div className="mt-8 relative">
             <div className="buddy-glass px-8 py-3 border-white/20 flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1 leading-none">Companion</span>
                  <span className="text-sm font-black text-white uppercase tracking-wider">
                    {gender === Gender.FEMALE ? 'Sakura Yamauchi' : 'Haruki Shiga'}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex gap-1.5 items-center">
                   <div className={`w-2.5 h-2.5 rounded-full ${state.isSpeaking ? 'bg-green-400 animate-ping' : 'bg-cyan-500/50'}`}></div>
                   <span className="text-[9px] font-bold text-cyan-400/80 uppercase">Active</span>
                </div>
             </div>
             
             {/* Sub-label for Engine */}
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-40">
                <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/50">Neural Core v2.5 Online</span>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(0.5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default Avatar;
