import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Clock, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Archive, 
  Lock,
  Smartphone,
  RefreshCw,
  Download,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { checkForAppUpdates, downloadAndInstallApk, CURRENT_APP_VERSION } from '../services/updateService';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onToggleSetting,
  onUpdateSetting,
  historyList = [],
  onClearHistory,
  onDeleteHistoryItem,
  currentUserEmail
}) {
  const [activeTab, setActiveTab] = useState('settings');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  useEffect(() => {
    if (isOpen && isAndroidNative) {
      handleCheckForUpdates(false);
    }
  }, [isOpen, isAndroidNative]);

  const handleCheckForUpdates = async (isManual = true) => {
    setCheckingUpdate(true);
    setToastMessage('');

    try {
      const result = await checkForAppUpdates();

      if (result.error) {
        setUpdateStatus('error');
        setToastMessage(result.message || '⚠️ Could not connect to update server.');
      } else if (result.hasUpdate) {
        setUpdateStatus('available');
        setUpdateData({
          version: result.latestVersion,
          downloadUrl: result.downloadUrl,
          notes: result.releaseNotes
        });
        setToastMessage(result.message);
      } else {
        setUpdateStatus('latest');
        setUpdateData({ version: CURRENT_APP_VERSION });
        setToastMessage(result.message);
      }
    } catch (err) {
      setUpdateStatus('error');
      setToastMessage('⚠️ Could not connect to update server.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  if (!isOpen) return null;

  const isUserLoggedIn = Boolean(currentUserEmail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-white/15 rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_0_60px_rgba(37,99,235,0.3)] relative overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">Control Center</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Settings & Preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex md:hidden grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferences</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History ({historyList.length})</span>
          </button>
        </div>

        {(activeTab === 'settings' || window.innerWidth >= 768) && (
          <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">

            {isAndroidNative && (
              <div className="p-3.5 sm:p-4 bg-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-3 relative overflow-hidden shadow-lg shadow-cyan-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">EasySubmit Mobile</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                          v{CURRENT_APP_VERSION}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Android System Update Center</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={checkingUpdate}
                    onClick={() => handleCheckForUpdates(true)}
                    className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${checkingUpdate ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] font-semibold hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {updateStatus === 'available' && updateData && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        New Version Available: {updateData.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
                      {updateData.notes}
                    </p>
                    <button
                      type="button"
                      onClick={() => downloadAndInstallApk(updateData.downloadUrl)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download & Install {updateData.version}</span>
                    </button>
                  </div>
                )}

                {updateStatus === 'latest' && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[11px] font-bold text-emerald-300">You are on the latest version</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/80">Up to date</span>
                  </div>
                )}

                {toastMessage && updateStatus !== 'latest' && updateStatus !== 'available' && (
                  <p className="text-[10px] font-medium text-amber-400 text-center animate-fade-in pt-0.5">
                    {toastMessage}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Auto-Format Filenames</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Renames file to <code className="text-cyan-300">[Section] Student - Title</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('autoFormatFilename')}
                className={`w-11 sm:w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer flex-shrink-0 ${
                  settings?.autoFormatFilename ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Client Compression</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Optimizes file size locally before uploading to Google Drive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('clientCompression')}
                className={`w-11 sm:w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer flex-shrink-0 ${
                  settings?.clientCompression ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Anti-Spam Rate Limit</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Prevents multiple spam uploads and limits max file size to 50MB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('rateLimiting')}
                className={`w-11 sm:w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer flex-shrink-0 ${
                  settings?.rateLimiting ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950/60 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Archive className="w-4 h-4 text-amber-400" />
                  <span>Zip Auto-Extractor</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Automatically extracts uploaded .zip archives into individual files.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('autoExtractZip')}
                className={`w-11 sm:w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer flex-shrink-0 ${
                  settings?.autoExtractZip ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className={`p-3.5 sm:p-4 bg-slate-950/60 border rounded-2xl space-y-3 transition ${
              isUserLoggedIn ? 'border-white/10 hover:border-cyan-500/30' : 'border-white/5 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Lock className={`w-4 h-4 ${isUserLoggedIn ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>Inactivity Auto-Lock</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {isUserLoggedIn
                      ? 'Automatically signs out after a period of user inactivity.'
                      : 'Connect Google Drive account first to enable auto-lock.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!isUserLoggedIn}
                  onClick={() => isUserLoggedIn && onToggleSetting('autoLockEnabled')}
                  className={`w-11 sm:w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
                    !isUserLoggedIn
                      ? 'bg-slate-800 cursor-not-allowed'
                      : settings?.autoLockEnabled
                      ? 'bg-cyan-500 justify-end shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer'
                      : 'bg-slate-700 justify-start cursor-pointer'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {isUserLoggedIn && settings?.autoLockEnabled && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">Set Inactivity Timeout:</span>
                  <select
                    value={settings?.autoLockMinutes || 15}
                    onChange={(e) => onUpdateSetting('autoLockMinutes', Number(e.target.value))}
                    className="bg-slate-900 border border-white/10 text-cyan-300 text-xs font-bold rounded-xl px-2.5 py-1 outline-none focus:border-cyan-400"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'history' && (
          <div className="block md:hidden space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400 truncate">
                {currentUserEmail ? `Account: ${currentUserEmail}` : 'Not connected'}
              </span>
              {historyList.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[11px] text-red-400 hover:underline font-semibold flex-shrink-0 ml-2"
                >
                  Clear All
                </button>
              )}
            </div>

            {!currentUserEmail ? (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="w-7 h-7 mx-auto text-amber-400" />
                <p className="text-xs font-bold text-slate-300">Google Drive Not Connected</p>
                <p className="text-[11px] text-slate-400">Connect account to view personal submission history.</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="w-7 h-7 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">No submission history found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyList.map((item, index) => (
                  <div
                    key={item.receiptId || index}
                    className="p-3.5 bg-slate-950/60 border border-white/10 rounded-2xl space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">{item.receiptId}</span>
                        <h4 className="font-bold text-white text-xs">{item.submissionType}</h4>
                        <p className="text-[11px] text-slate-400">{item.fullName} • {item.section}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(index)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
                      <span>{item.timestamp}</span>
                      {item.folderUrl && (
                        <a
                          href={item.folderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>View Folder</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}