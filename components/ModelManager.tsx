
import React, { useState } from 'react';
import { ModelItem } from '../types';

interface ModelManagerProps {
  models: ModelItem[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
  onUploadModel: (file: File) => void;
  onDeleteModel: (id: string) => void;
}

const ModelManager: React.FC<ModelManagerProps> = ({ 
  models, 
  activeModelId, 
  onSelectModel, 
  onUploadModel,
  onDeleteModel 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    // Add small timeout to show spinner
    setTimeout(() => {
      onUploadModel(file);
      setIsUploading(false);
      e.target.value = '';
    }, 500);
  };

  return (
    <div className="buddy-glass p-5 border border-white/5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
          Sprite Library
        </h3>
        
        <label className={`cursor-pointer group relative flex items-center justify-center w-7 h-7 rounded-xl transition-all ${isUploading ? 'bg-white/5' : 'bg-white/10 hover:bg-white hover:text-black shadow-lg hover:scale-110 active:scale-95'}`}>
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          )}
          <input 
            type="file" 
            accept=".png,.jpg,.jpeg,.webp" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={isUploading} 
          />
        </label>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {models.map((model) => {
          return (
            <div 
              key={model.id}
              className={`group relative flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                activeModelId === model.id 
                  ? 'bg-white/15 border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-[1.02]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
              onClick={() => onSelectModel(model.id)}
            >
              <div className="flex items-center gap-3 truncate">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  activeModelId === model.id ? 'bg-white text-black' : 'bg-white/10 text-white/40'
                }`}>
                  <img src={model.url} className="w-full h-full object-cover" alt="Sprite" />
                </div>
                <div className="flex flex-col truncate">
                  <span className={`text-[10px] font-bold truncate ${activeModelId === model.id ? 'text-white' : 'text-white/60'}`}>
                    {model.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7px] px-1 rounded uppercase font-black bg-blue-500/20 text-blue-400">
                      2D Sprite
                    </span>
                    {model.isDefault && <span className="text-[7px] text-white/20 uppercase">Default</span>}
                  </div>
                </div>
              </div>

              {!model.isDefault && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteModel(model.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[8px] text-white/20 italic leading-tight px-1 text-center">
        Drop <b>.png/.jpg</b> for 2D sprites.
      </p>
    </div>
  );
};

export default ModelManager;
