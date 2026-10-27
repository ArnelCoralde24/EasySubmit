import React from 'react';
import { X, FileText, Eye } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, file }) {
  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-5 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <h3 className="text-xs font-bold text-white truncate">{file.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center min-h-[200px] bg-slate-950/60 rounded-2xl border border-white/5 p-4">
          {isImage ? (
            <img src={previewUrl} alt={file.name} className="max-h-80 w-auto rounded-xl object-contain shadow-md" />
          ) : (
            <div className="text-center space-y-2 py-8">
              <FileText className="w-12 h-12 text-cyan-400 mx-auto opacity-80" />
              <p className="text-xs font-bold text-slate-200">{file.name}</p>
              <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document File'}</p>
              <span className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold rounded-full mt-2">
                Ready for submission
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}