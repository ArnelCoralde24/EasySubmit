import React from 'react';
import { X, BookOpen, KeyRound, Link2, Send, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md sm:max-w-lg bg-slate-900 border border-slate-700/60 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-6 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[11px] font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>User Guide</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">How EasySubmit Works</h2>
          <p className="text-xs text-slate-400">
            Submit your requirements to your teacher's Google Drive in 3 simple steps.
          </p>
        </div>

        <div className="space-y-3 overflow-y-auto my-4 pr-1 text-xs custom-scrollbar flex-1">
          
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
              1
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Connect Your Google Drive
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Click the <strong className="text-blue-400">"Connect Drive"</strong> button at the top header to authorize secure direct uploads.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
              2
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                Paste Teacher's Folder Link
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Copy the shared Google Drive folder link from your teacher and paste it into Step 1 input box.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
              3
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Fill Student Info & Upload
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Enter your Name and Section, choose your category or files, then tap <strong className="text-emerald-400">"Submit to Google Drive"</strong>.
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-1">
            <p className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Automatic Organization
            </p>
            <p className="text-[10px] text-slate-400">
              EasySubmit automatically generates your personal folder format: <code className="text-blue-300 font-mono">[Section] Student Name &gt; Submission Folder</code>.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/25 active:scale-98 transition-all flex-shrink-0"
        >
          Got it, let's start!
        </button>

      </div>
    </div>
  );
}