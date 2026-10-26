import React from 'react';
import { X, BookOpen, UploadCloud, FolderCheck, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-slate-100 shadow-2xl my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>How EasySubmit Works</span>
          </h2>
          <p className="text-xs text-slate-400">Step-by-step guide to submit your school assignments seamlessly.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-bold text-slate-200">Connect Google Drive</p>
              <p className="text-slate-400 mt-0.5">Click "Connect Drive" in the header so EasySubmit can build folders directly inside your teacher's Drive.</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-bold text-slate-200">Paste Shared Folder Link</p>
              <p className="text-slate-400 mt-0.5">Paste the link provided by your teacher to target the exact destination.</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-bold text-slate-200">Fill Info & Upload Files</p>
              <p className="text-slate-400 mt-0.5">Enter your name and section, select your category/files, and hit Submit to automatically create your personal student folder!</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}