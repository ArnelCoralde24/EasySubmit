import React from 'react';
import { X, Sliders, ShieldCheck, Zap, FileText, Lock } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onToggleSetting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-6 shadow-[0_0_50px_rgba(37,99,235,0.25)] relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System & Security Settings</h2>
              <p className="text-[11px] text-slate-400">Configure portal features & protection levels</p>
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

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Auto-Format Filenames</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Standardizes file names to <code>[Section] Student - Activity</code> format for teachers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleSetting('autoFormatFilename')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                settings.autoFormatFilename ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  settings.autoFormatFilename ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Client-Side Compression</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Optimizes images and document payloads locally before uploading to reduce data usage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleSetting('clientCompression')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                settings.clientCompression ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  settings.clientCompression ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Rate-Limiting & Anti-Spam</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prevents rapid repeated uploads and limits maximum individual file size to 50MB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleSetting('rateLimiting')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                settings.rateLimiting ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  settings.rateLimiting ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}