import React from 'react';
import { X, Clock, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

export default function HistoryModal({
  isOpen,
  onClose,
  historyList,
  onClearHistory,
  onDeleteHistoryItem,
  currentUserEmail
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-5 shadow-[0_0_50px_rgba(37,99,235,0.25)] relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submission History</h2>
              <p className="text-[11px] text-slate-400">
                {currentUserEmail ? `Bound to: ${currentUserEmail}` : 'Log in to view your history'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[11px] text-red-400 hover:underline font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!currentUserEmail ? (
          <div className="py-10 text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
            <p className="text-xs font-bold text-slate-300">Sign in Required</p>
            <p className="text-[11px] text-slate-400">Connect your Google Account to view your submission history.</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No submission history found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {historyList.map((item, index) => (
              <div
                key={item.receiptId || index}
                className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-2 text-xs relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{item.receiptId}</span>
                    <h4 className="font-bold text-white text-sm">{item.submissionType}</h4>
                    <p className="text-[11px] text-slate-400">{item.fullName} • {item.section}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(index)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <span>{item.timestamp}</span>
                  {item.folderUrl && (
                    <a
                      href={item.folderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>Open Folder</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}