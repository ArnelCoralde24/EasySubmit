import React from 'react';
import { CheckCircle2, ExternalLink, X, FileText } from 'lucide-react';

export default function SubmissionReceiptModal({ receiptData, onClose }) {
  if (!receiptData) return null;

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

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Submission Successful!</h2>
          <p className="text-xs text-slate-400">Your files have been safely uploaded to Google Drive.</p>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-xl border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Receipt ID:</span>
            <span className="font-mono text-emerald-400 font-bold">{receiptData.receiptId}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Student Name:</span>
            <span className="font-semibold text-slate-200">{receiptData.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Section:</span>
            <span className="font-semibold text-slate-200">{receiptData.section}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Submission Type:</span>
            <span className="font-semibold text-slate-200">{receiptData.submissionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Timestamp:</span>
            <span className="text-slate-300">{receiptData.timestamp}</span>
          </div>
        </div>

        {receiptData.folderUrl && (
          <a
            href={receiptData.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Folder in Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}