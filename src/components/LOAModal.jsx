import React, { useState } from 'react';
import { FileText, Calendar, AlertCircle, Check, X } from 'lucide-react';

export default function LOAModal({ isOpen, onClose, onSave, studentInfo }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Medical / Illness');
  const [detailedReason, setDetailedReason] = useState('');
  const [generateLetter, setGenerateLetter] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let generatedFile = null;
    if (generateLetter) {
      const letterText = `LEAVE OF ABSENCE (LOA) REQUEST FORM
--------------------------------------------------
Date Generated: ${new Date().toLocaleDateString()}

STUDENT INFORMATION:
Name: ${studentInfo.fullName || 'N/A'}
Section / Year: ${studentInfo.section || 'N/A'}
Student ID: ${studentInfo.studentId || 'N/A'}
Subject / Course: ${studentInfo.subject || 'N/A'}

ABSENCE DETAILS:
Inclusive Dates: ${startDate} to ${endDate}
Reason Category: ${reasonCategory}

EXPLANATION / ADDITIONAL NOTES:
${detailedReason || 'No additional notes provided.'}

--------------------------------------------------
Submitted via EasySubmit Portal
`;

      const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8' });
      generatedFile = new File([blob], `LOA_Excuse_Letter_${studentInfo.fullName?.replace(/\s+/g, '_') || 'Student'}.txt`, {
        type: 'text/plain',
      });
    }

    onSave({
      startDate,
      endDate,
      reasonCategory,
      detailedReason,
      generatedFile,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-lg w-full rounded-2xl p-6 space-y-5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">LOA Details & Letter Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dates Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Start Date of Absence *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                End Date of Absence *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Primary Reason *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Medical / Illness">Medical / Health Condition</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Bereavement">Bereavement / Passing of Relative</option>
              <option value="Official School Event">Official School Event / Competition</option>
              <option value="Other Personal Reason">Other Personal Reason</option>
            </select>
          </div>

          {/* Explanation Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Detailed Explanation
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or explanation for your leave..."
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Generate Excuse Letter Checkbox */}
          <label className="flex items-center gap-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer">
            <input
              type="checkbox"
              checked={generateLetter}
              onChange={(e) => setGenerateLetter(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300 block">
                Auto-generate Excuse Letter Document (.txt)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Will automatically attach an official excuse letter alongside your medical/supporting documents.
              </span>
            </div>
          </label>

          {/* Form Controls */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition"
            >
              Confirm LOA Details
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}