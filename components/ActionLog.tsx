
import React from 'react';
import { ToolAction } from '../types';

interface ActionLogProps {
  actions: ToolAction[];
}

const ActionLog: React.FC<ActionLogProps> = ({ actions }) => {
  return (
    <div className="buddy-glass p-5 border border-white/5">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>
        Command History
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {actions.length === 0 ? (
          <p className="text-[10px] text-white/10 italic text-center py-4 uppercase tracking-tighter">No commands executed</p>
        ) : (
          actions.slice().reverse().map(action => (
            <div key={action.id} className="bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-black text-white/80 uppercase tracking-tighter">{action.name}</span>
                <span className="text-[8px] text-white/20">{new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-[10px] text-white/40 font-mono truncate">
                {JSON.stringify(action.args)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionLog;
