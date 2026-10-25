import React from 'react';
import { Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UploadProgressModal({
  isOpen,
  currentFileName,
  progressPercentage,
  completedCount,
  totalFiles,
  statusMessage,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-md w-full rounded-2xl p-6 space-y-5 bg-white/95 dark:bg-slate-900/95 border border-indigo-500/30 shadow-2xl">
        
        <div className="text-center space-y-2">
          {error ? (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1 animate-bounce">
              <Upload className="w-6 h-6" />
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {error ? 'Upload Error' : 'Uploading Submissions...'}
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {statusMessage || 'Transmitting files directly to Google Drive server...'}
          </p>
        </div>

        {!error && (
          <div className="space-y-3">
            {/* Real-time Percentage Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                  {currentFileName || 'Preparing files...'}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-200 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* File Completion Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span>Overall Progress</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {completedCount} of {totalFiles} Files Completed
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}