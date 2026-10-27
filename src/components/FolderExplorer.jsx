import React, { useRef, useState } from 'react';
import { Folder, FileText, Trash2, ChevronRight, UploadCloud, FolderPlus, Loader2, ExternalLink, Lock } from 'lucide-react';

export default function FolderExplorer({
  folderContents = [],
  currentFolderId,
  rootFolderId,
  breadcrumbs = [],
  onBreadcrumbClick,
  onFolderClick,
  onDeleteItem,
  onAddFilesToFolder,
  isLoading = false,
  myCreatedIds = [],
  currentUserEmail = '',
  isAccessClosed = false
}) {
  const fileInputRef = useRef(null);
  const [isUploadingInside, setIsUploadingInside] = useState(false);

  const handleInnerFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setIsUploadingInside(true);
      if (onAddFilesToFolder) {
        await onAddFilesToFolder(selectedFiles, currentFolderId);
      }
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
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-3.5 sm:p-5 space-y-3.5 backdrop-blur-2xl select-none">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap font-medium max-w-full overflow-x-auto py-0.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick && onBreadcrumbClick(idx)}
                  className={`hover:underline flex items-center gap-1 transition-colors flex-shrink-0 ${
                    isLast ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {idx === 0 ? <Folder className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> : null}
                  <span className="truncate max-w-[120px] sm:max-w-none">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {onAddFilesToFolder && (
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
              disabled={isUploadingInside || isAccessClosed}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isUploadingInside ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span>Add File / Folder Here</span>
            </button>
          </div>
        )}
      </div>

      {isAccessClosed ? (
        <div className="py-8 px-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white tracking-wide">Submission Folder Access Closed</h4>
          <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
            The owner has restricted or closed access to this Google Drive folder. Please check with your instructor or verify the link.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs text-slate-400">Loading folder contents...</p>
        </div>
      ) : folderContents.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <FolderPlus className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs font-semibold text-slate-400">This folder is empty</p>
          <p className="text-[11px] text-slate-500">Submissions will appear here once files are uploaded.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
          {folderContents.map((item) => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            const isOwnerByEmail = currentUserEmail && item.owners?.some(
              (owner) => owner.emailAddress?.toLowerCase() === currentUserEmail.toLowerCase()
            );
            const isMine = isOwnerByEmail || myCreatedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 hover:border-white/20 rounded-2xl transition-all group active:scale-[0.99]"
              >
                <div
                  onClick={() => {
                    if (isFolder && onFolderClick) {
                      onFolderClick(item);
                    } else if (item.webViewLink) {
                      window.open(item.webViewLink, '_blank');
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isFolder ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-white/10'
                  }`}>
                    {isFolder ? <Folder className="w-4 h-4 fill-cyan-400/20" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                        {item.name}
                      </p>
                      {isMine && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-md text-[9px] font-bold flex-shrink-0">
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
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
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
                        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                          onDeleteItem && onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors"
                      title="Delete your item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="p-1.5 text-slate-600 cursor-not-allowed" title="Protected">
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