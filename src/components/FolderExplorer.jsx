import React, { useState } from 'react';
import { 
  Folder, FileText, Upload, ChevronRight, 
  RefreshCw, FolderPlus, Edit2, Trash2, ExternalLink, HardDrive 
} from 'lucide-react';

export default function FolderExplorer({
  folderContents,
  currentFolderId,
  breadcrumbs,
  isLoading,
  user
}) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800/80">
      
      {/* Explorer Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap text-sm font-medium text-slate-600 dark:text-slate-300">
          <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            <HardDrive className="w-4 h-4 text-indigo-500" />
            <span>Root Folder</span>
          </button>

          {breadcrumbs?.map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold rounded-lg transition border border-indigo-200/50 dark:border-indigo-800/50"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        )}

      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
          <span className="text-sm font-medium">Loading Google Drive contents...</span>
        </div>
      ) : !folderContents || folderContents.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Folder className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This folder is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
          {folderContents.map((item) => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/50 transition shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isFolder ? (
                    <Folder className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isFolder ? 'Folder' : `${(item.size ? (item.size / 1024).toFixed(0) : 0)} KB`}
                    </p>
                  </div>
                </div>

                {item.webViewLink && (
                  <a
                    href={item.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}