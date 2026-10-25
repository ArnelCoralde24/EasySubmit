import React from 'react';
import { HelpCircle, FolderUp, ShieldCheck, UploadCloud, X, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-xl w-full rounded-2xl p-6 sm:p-8 space-y-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">How EasySubmit Works</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4 text-sm">
          <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Teacher's Drive Link</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The teacher pastes their shared Google Drive folder link. Make sure the link access is set to 
                <span className="font-medium text-indigo-600 dark:text-indigo-400"> "Anyone with the link can edit"</span>.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Student Info & Category</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Students enter their name, section, and choose submission category (Assignment, Activity, Project, or LOA Form). No student login is required!
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Automated Subfolder Creation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                EasySubmit automatically organizes uploads inside category subfolders (e.g., <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">Projects / [Section] Student Name</code>) inside the teacher's Drive.
              </p>
            </div>
          </div>
        </div>

        {/* Security / Privacy Badge */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>
            <strong>Secure & Private:</strong> OAuth tokens are held strictly in memory and are never saved in local storage.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
        >
          Got It, Thanks!
        </button>

      </div>
    </div>
  );
}