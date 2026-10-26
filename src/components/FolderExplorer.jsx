import React from 'react';
import { Folder, FileText, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

export default function FolderExplorer({
  folderContents,
  currentFolderId,
  breadcrumbs,
  onBreadcrumbClick,
  onFolderClick,
  isLoading,
  user
}) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto pb-1 font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id || idx}>
            <button
              type="button"
              onClick={() => onBreadcrumbClick && onBreadcrumbClick(idx)}
              className={`hover:text-blue-500 transition-colors whitespace-nowrap ${
                idx === breadcrumbs.length - 1 ? 'font-bold text-slate-900 dark:text-white' : ''
              }`}
            >
              {crumb.name}
            </button>
            {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Contents Area */}
      {isLoading ? (
        <div className="py-8 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
          <p className="text-xs text-slate-500">Checking Google Drive in real-time...</p>
        </div>
      ) : folderContents.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400">
            <Folder className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This folder is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {folderContents.map((item) => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div
                key={item.id}
                onClick={() => isFolder && onFolderClick && onFolderClick(item)}
                className={`p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between gap-2 text-xs transition-all ${
                  isFolder ? 'hover:bg-blue-500/10 hover:border-blue-500/40 cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isFolder ? (
                    <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                </div>

                {isFolder ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                ) : (
                  item.webViewLink && (
                    <a
                      href={item.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}