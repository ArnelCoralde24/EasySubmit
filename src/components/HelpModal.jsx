import React from 'react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200">
      <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0d1322] space-y-3.5 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              How EasySubmit Works
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List - Compact Design Without Scroll */}
        <div className="space-y-2.5 text-xs">
          
          {/* Step 1 */}
          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Teacher's Drive Link</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Paste shared folder link. Ensure access is set to <span className="text-blue-600 dark:text-blue-400 font-medium">"Anyone with the link can edit"</span>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Student Info & Category</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Enter name, section, and pick submission category (Assignment, Activity, Project, LOA).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Automated Subfolder Creation</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                EasySubmit automatically organizes files inside student subfolders directly in Google Drive.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span><strong>Secure & Private:</strong> OAuth tokens are held strictly in memory and never saved in storage.</span>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition active:scale-98"
        >
          Got It, Thanks!
        </button>

      </div>
    </div>
  );
}