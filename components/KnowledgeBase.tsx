
import React, { useState } from 'react';
import { DocumentItem } from '../types';

interface KnowledgeBaseProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onRemoveDocument: (id: string) => void;
  onToggleDocument: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents, onAddDocument, onRemoveDocument, onToggleDocument }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await (window as any).pdfjsLib.getDocument(typedArray).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(' ') + '\n';
        }

        const newDoc: DocumentItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: fullText,
          size: file.size,
          isActive: true
        };
        onAddDocument(newDoc);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("PDF Error:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="buddy-glass p-4 border border-white/5 flex flex-col gap-3 flex-1 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
          PDF Knowledge
        </h3>
        <label className={`cursor-pointer px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase transition-all ${isProcessing ? 'opacity-50' : 'bg-white/10 hover:bg-white hover:text-black'}`}>
          {isProcessing ? 'Processing...' : '+ Add'}
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {documents.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-10">
            <span className="text-[8px] uppercase tracking-tighter">No files loaded</span>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className={`group flex items-center justify-between p-2 rounded-xl border transition-all ${doc.isActive ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/2 border-white/5 opacity-40'}`}>
              <div className="flex flex-col flex-1 truncate mr-2 cursor-pointer" onClick={() => onToggleDocument(doc.id)}>
                <span className={`text-[9px] font-bold truncate ${doc.isActive ? 'text-cyan-400' : 'text-white/40'}`}>{doc.name}</span>
                <span className="text-[7px] text-white/20 uppercase">{(doc.size / 1024).toFixed(0)} KB</span>
              </div>
              <button 
                onClick={() => onRemoveDocument(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-500 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
