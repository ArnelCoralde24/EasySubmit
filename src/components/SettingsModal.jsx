import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Zap, FileText, Clock, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onToggleSetting,
  historyList = [],
  onClearHistory,
  onDeleteHistoryItem,
  currentUserEmail
}) {
  const [activeTab, setActiveTab] = useState('settings');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_0_60px_rgba(37,99,235,0.3)] relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Control Center</h2>
              <p className="text-[11px] text-slate-400">Settings & Submission Records</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex md:hidden grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferences</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History ({historyList.length})</span>
          </button>
        </div>

        {(activeTab === 'settings' || window.innerWidth >= 768) && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Auto-Format Filenames</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Renames file to <code className="text-cyan-300">[Section] Student - Title</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('autoFormatFilename')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                  settings?.autoFormatFilename ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Client Compression</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Optimizes file size locally before uploading to Google Drive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('clientCompression')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                  settings?.clientCompression ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Anti-Spam Rate Limit</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Prevents multiple spam uploads and limits max file size to 50MB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('rateLimiting')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                  settings?.rateLimiting ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="block md:hidden space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">
                {currentUserEmail ? `Account: ${currentUserEmail}` : 'Not connected'}
              </span>
              {historyList.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[11px] text-red-400 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {!currentUserEmail ? (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="w-7 h-7 mx-auto text-amber-400" />
                <p className="text-xs font-bold text-slate-300">Google Drive Not Connected</p>
                <p className="text-[11px] text-slate-400">Connect account to view personal submission history.</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="w-7 h-7 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">No submission history found</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {historyList.map((item, index) => (
                  <div
                    key={item.receiptId || index}
                    className="p-3.5 bg-slate-950/60 border border-white/10 rounded-2xl space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">{item.receiptId}</span>
                        <h4 className="font-bold text-white text-xs">{item.submissionType}</h4>
                        <p className="text-[11px] text-slate-400">{item.fullName} • {item.section}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(index)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
                      <span>{item.timestamp}</span>
                      {item.folderUrl && (
                        <a
                          href={item.folderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>View Folder</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}