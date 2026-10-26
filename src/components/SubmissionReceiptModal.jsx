import React from 'react';
import { CheckCircle2, ExternalLink, Download, X, FileText } from 'lucide-react';

export default function SubmissionReceiptModal({ receiptData, onClose }) {
  if (!receiptData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200">
      <div className="w-full max-w-md rounded-2xl p-5 border border-slate-300 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0e1526] space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submission Successful!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receipt ID: <span className="font-mono text-blue-500 font-bold">{receiptData.receiptId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Information Details */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Student Name:</span>
            <span className="font-bold text-slate-900 dark:text-white">{receiptData.fullName || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Class Section:</span>
            <span className="font-bold text-slate-900 dark:text-white">{receiptData.section || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Category / Title:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{receiptData.submissionType}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Date & Time:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{receiptData.timestamp}</span>
          </div>
        </div>

        {/* Submitted Files List */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Uploaded Files ({receiptData.files?.length || 0})
          </span>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {receiptData.files?.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs border border-slate-200 dark:border-white/5">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate text-slate-800 dark:text-slate-200 font-medium">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 space-y-2">
          {receiptData.folderUrl && (
            <a
              href={receiptData.folderUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>View Folder in Google Drive</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}