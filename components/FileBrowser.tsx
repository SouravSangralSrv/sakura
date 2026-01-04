
import React, { useState, useEffect, useRef } from 'react';
import { FileSystemService, FileItem } from '../services/fileSystemService';

interface FileBrowserProps {
  onClose: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onClose }) => {
  const [currentPath, setCurrentPath] = useState(FileSystemService.getDesktopPath());
  const [items, setItems] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // UI State for creating new items
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const loadDirectory = (path: string) => {
    const result = FileSystemService.getDirectoryInfo(path);
    if (typeof result === 'string') {
      setError(result);
      setItems([]);
    } else {
      setError(null);
      setItems(result);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
      setIsCreating(null);
    } else {
      FileSystemService.openFile(item.path);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setIsCreating(null);
      return;
    }

    const result = isCreating === 'folder' 
      ? FileSystemService.createFolder(currentPath, newName)
      : FileSystemService.createFile(currentPath, newName);

    if (result === true) {
      setNewName('');
      setIsCreating(null);
      loadDirectory(currentPath);
    } else {
      alert(result);
    }
  };

  const goBack = () => {
    const parent = FileSystemService.getParentPath(currentPath);
    if (parent !== currentPath) {
      setCurrentPath(parent);
      setIsCreating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="buddy-glass w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden no-drag">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={goBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest">File Browser</h3>
              <p className="text-[10px] text-white/30 truncate max-w-md font-mono">{currentPath}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCreating('folder')}
              className="p-2 text-white/40 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              title="New Folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            </button>
            <button 
              onClick={() => setIsCreating('file')}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              title="New File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>
            <div className="w-px h-6 bg-white/5 mx-2"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <p className="text-sm text-white/60 font-medium">{error}</p>
              <p className="text-[10px] text-white/20 mt-2">Make sure you have appropriate permissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Inline Creation Input */}
              {isCreating && (
                <form 
                  onSubmit={handleCreateSubmit}
                  className="bg-white/5 border border-white/20 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCreating === 'folder' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                    {isCreating === 'folder' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                  </div>
                  <input 
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={isCreating === 'folder' ? "Folder Name..." : "File Name..."}
                    onBlur={() => !newName && setIsCreating(null)}
                    className="flex-1 bg-transparent border-none text-xs font-bold text-white outline-none placeholder:text-white/20"
                  />
                  <div className="flex gap-2">
                     <button type="submit" className="p-1.5 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/40 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                     </button>
                     <button type="button" onClick={() => setIsCreating(null)} className="p-1.5 bg-white/5 text-white/40 rounded-md hover:bg-white/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.isDirectory ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                      {item.isDirectory ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors truncate">{item.name}</p>
                      <p className="text-[9px] text-white/20 uppercase tracking-tighter">
                        {item.isDirectory ? 'Folder' : 'File'}
                      </p>
                    </div>
                  </button>
                ))}
                {items.length === 0 && !isCreating && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-xs text-white/10 uppercase tracking-[0.4em]">Directory is empty</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
             {items.length} Objects Found
           </span>
           <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
              <span className="w-2 h-2 rounded-full bg-white/10"></span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default FileBrowser;
