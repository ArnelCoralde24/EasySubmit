import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-[99999] bg-[#050814]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300">
      {/* Floating Background Neon Liquid Blobs */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Main Glassmorphism Modal Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)] backdrop-blur-2xl my-auto animate-in zoom-in-95 duration-200">
        
        {/* Neon Liquid Loading Ring Container */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          {/* Animated Glowing Ring Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 animate-spin blur-md opacity-70" style={{ animationDuration: '4s' }} />
          
          {/* Liquid Ring Cutout overlay */}
          <div className="absolute inset-1.5 bg-[#070b1e] rounded-full flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
            
            {/* Inner Content Text inside Ring */}
            <div className="relative z-10 space-y-1 px-2">
              <p className="text-base sm:text-lg font-black text-white tracking-wide">
                {error ? 'Upload Error' : 'Uploading...'}
              </p>
              <p className="text-[10px] text-cyan-300 font-medium tracking-wider uppercase">
                {error ? 'Action Interrupted' : 'Please wait a moment'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic File Status & File Progress Count */}
        <div className="space-y-1.5">
          {error ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center gap-2 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-300 truncate max-w-[260px] mx-auto">
                {currentFileName ? `Uploading: ${currentFileName}` : 'Preparing school files...'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                File {completedCount} of {totalFiles || 1}
              </p>
            </>
          )}
        </div>

        {/* Smooth Glass Liquid Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="relative w-full h-3.5 bg-slate-900/80 border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.8)] relative"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Internal Glass Highlight */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-mono font-bold px-1">
            <span className="text-cyan-400 text-[11px]">EasySubmit Engine</span>
            <span className="text-purple-300">{progressPercentage}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}