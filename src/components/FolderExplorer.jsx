import React, { useRef, useState } from 'react';
import { Folder, FileText, Trash2, ChevronRight, UploadCloud, FolderPlus, Loader2, ExternalLink, Lock } from 'lucide-react';

export default function FolderExplorer({
  folderContents,
  currentFolderId,
  rootFolderId,
  breadcrumbs,
  onBreadcrumbClick,
  onFolderClick,
  onDeleteItem,
  onAddFilesToFolder,
  isLoading,
  myCreatedIds = []
}) {
  const fileInputRef = useRef(null);
  const [isUploadingInside, setIsUploadingInside] = useState(false);

  const handleInnerFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setIsUploadingInside(true);
      await onAddFilesToFolder(selectedFiles, currentFolderId);
      setIsUploadingInside(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(idx)}
                  className={`hover:underline flex items-center gap-1 transition ${
                    isLast ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {idx === 0 ? <Folder className="w-3.5 h-3.5 text-cyan-400" /> : null}
                  <span>{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInnerFileChange}
          />
          <button
            type="button"
            disabled={isUploadingInside}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            {isUploadingInside ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-cyan-300" />
            )}
            <span>Add File / Folder Here</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs text-slate-400">Loading folder contents...</p>
        </div>
      ) : folderContents.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <FolderPlus className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs font-semibold text-slate-400">This folder is empty</p>
          <p className="text-[11px] text-slate-500">You can upload files directly into this directory using the button above.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {folderContents.map((item) => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            const isMine = myCreatedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 hover:border-white/20 rounded-2xl text-xs transition-all group"
              >
                <div
                  onClick={() => {
                    if (isFolder) {
                      onFolderClick(item);
                    } else if (item.webViewLink) {
                      window.open(item.webViewLink, '_blank');
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-3"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isFolder ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-white/10'
                  }`}>
                    {isFolder ? <Folder className="w-4 h-4 fill-cyan-400/20" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-200 group-hover:text-cyan-300 truncate transition">
                        {item.name}
                      </p>
                      {isMine && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-md text-[9px] font-bold">
                          Yours
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {isFolder ? 'Folder' : formatFileSize(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.webViewLink && (
                    <a
                      href={item.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                      title="Open in Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isMine ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Sigurado ka bang gusto mong burahin ang "${item.name}"?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition"
                      title="Delete your item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="p-1.5 text-slate-600 cursor-not-allowed" title="Protected (Created by another user)">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}