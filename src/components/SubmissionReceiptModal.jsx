import React from 'react';
import { CheckCircle2, ExternalLink, X, FileCheck2 } from 'lucide-react';

export default function SubmissionReceiptModal({ receiptData, onClose }) {
  if (!receiptData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-3xl p-5 sm:p-6 space-y-5 text-slate-100 shadow-2xl my-auto max-h-[90vh]">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Submission Successful!</h2>
          <p className="text-xs text-slate-400">Your files have been safely created & uploaded to Google Drive.</p>
        </div>

        <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/50 space-y-2.5 text-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-slate-400">Receipt ID:</span>
            <span className="font-mono text-emerald-400 font-bold">{receiptData.receiptId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-slate-400">Student Name:</span>
            <span className="font-semibold text-slate-200">{receiptData.fullName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-slate-400">Section:</span>
            <span className="font-semibold text-slate-200">{receiptData.section}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-slate-400">Submission Folder:</span>
            <span className="font-semibold text-slate-200">{receiptData.submissionType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Timestamp:</span>
            <span className="text-slate-300">{receiptData.timestamp}</span>
          </div>
        </div>

        {receiptData.folderUrl && (
          <a
            href={receiptData.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all"
          >
            <span>View Folder in Google Drive</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

      </div>
    </div>
  );
}