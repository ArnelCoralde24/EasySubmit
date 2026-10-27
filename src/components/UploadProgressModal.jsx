import React from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function UploadProgressModal({
  isOpen,
  currentFileName,
  progressPercentage,
  completedCount,
  totalFiles,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-5 shadow-[0_0_50px_rgba(37,99,235,0.3)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 animate-pulse" />

        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          {error ? (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          ) : progressPercentage === 100 && completedCount === totalFiles ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : (
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">
            {error ? 'Upload Error' : 'Uploading to Google Drive...'}
          </h3>
          <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
            {currentFileName || 'Processing files...'}
          </p>
        </div>

        {!error && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">File {completedCount} of {totalFiles}</span>
              <span className="text-cyan-400 font-bold text-sm">{progressPercentage}%</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}