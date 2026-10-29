import React from 'react';
import { Info, Download } from 'lucide-react';

export const UpdateModal = ({ isOpen, isForced, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all select-none">
      <div className="relative w-full max-w-sm rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-indigo-950/85 to-slate-950/95 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isForced ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' : 'bg-blue-500/20 border border-blue-400/40 text-cyan-400'
          }`}>
            {isForced ? <Download className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-snug">
              Please Update to New Version
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              A new version is available with improved features and bug fixes.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {!isForced && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Ok
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`py-2 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isForced 
                ? 'w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
            }`}
          >
            {isForced ? (
              <>
                <Download className="w-4 h-4" />
                <span>Update & install</span>
              </>
            ) : (
              <span>Update Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};