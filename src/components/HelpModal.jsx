import React from 'react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200">
      <div className="w-full max-w-md rounded-2xl p-5 border border-slate-300 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0e1526] space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              How EasySubmit Works
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex gap-3 items-start">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Teacher's Drive Link</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Paste shared link. Access must be set to <span className="text-blue-600 dark:text-blue-400 font-bold">"Anyone with the link can edit"</span>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex gap-3 items-start">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Student Info & Category</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Enter your name & section, then pick your submission category.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex gap-3 items-start">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Automated Folders</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                EasySubmit automatically organizes files into student folders in Drive.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span><strong>Secure & Private:</strong> Direct browser-to-Drive upload with no intermediate server storage.</span>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition active:scale-98"
        >
          Got It, Thanks!
        </button>

      </div>
    </div>
  );
}