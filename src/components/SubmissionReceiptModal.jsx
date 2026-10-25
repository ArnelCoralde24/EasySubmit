import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, FileText, Folder, Copy, Check } from 'lucide-react';

export default function SubmissionReceiptModal({ receiptData, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!receiptData) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(receiptData.receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-xl w-full rounded-2xl p-6 sm:p-8 space-y-6 relative border border-emerald-500/30 shadow-2xl bg-white/90 dark:bg-slate-900/90">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Submission Successful!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your files have been securely uploaded directly to your teacher's Google Drive.
          </p>
        </div>

        {/* Receipt ID Badge */}
        <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Receipt Reference Number</span>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {receiptData.receiptId}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptData.fullName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Section / Year:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptData.section}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Submission Category:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{receiptData.submissionType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptData.timestamp}</span>
          </div>
        </div>

        {/* Files Submitted */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Uploaded Files ({receiptData.files?.length || 0})
          </span>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {receiptData.files?.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs border border-slate-200/50 dark:border-slate-700/40"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                </div>
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 font-medium"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Drive Folder Link */}
        {receiptData.folderUrl && (
          <a
            href={receiptData.folderUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition text-xs"
          >
            <Folder className="w-4 h-4" />
            Open Drive Subfolder
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
        >
          Close & Done
        </button>

      </div>
    </div>
  );
}