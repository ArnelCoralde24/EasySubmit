import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  BookOpen, FileCheck, Package, UploadCloud, Send, Link2, Clipboard as ClipboardIcon, X,
  FileText, Trash2, Users, RefreshCw, MinusCircle, Home,
  FolderOpen, ShieldCheck, Sliders, Clock, Eye, Save, Check, Camera
} from "lucide-react";
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';
import Header from "./components/Header";
import FolderExplorer from "./components/FolderExplorer";
import UploadProgressModal from './components/UploadProgressModal';
import SubmissionReceiptModal from './components/SubmissionReceiptModal';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import PrivacyModal from './components/PrivacyModal';
import FilePreviewModal from './components/FilePreviewModal';
import DocumentScannerModal from './components/DocumentScannerModal';
import BiometricLockScreen from './components/BiometricLockScreen';
import { NetworkModal } from './components/NetworkModal';
import { NotificationToast } from './components/NotificationToast';
import { UpdateModal } from './components/UpdateModal';
import { checkForAppUpdates, downloadAndInstallApk } from './services/updateService';
import { initGoogleAuth, signInWithGoogle, signOutGoogle } from './services/googleAuth';
import { checkDeviceIntegrity } from './services/securityService';
import { addToOfflineQueue, triggerLocalNotification } from './services/queueService';
import { 
  extractFolderId, 
  fetchFolderContents, 
  createDriveFolder, 
  uploadFileToDrive, 
  deleteDriveItem,
  verifyFileMagicBytes,
  revokeGoogleToken,
  sanitizeString,
  fetchCloudHistory,
  saveCloudHistory
} from './services/driveService';

const GOOGLE_CLIENT_ID = "431007270977-j9h45it3o6fclmko97tttuioovqgb9m0.apps.googleusercontent.com";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'vbs', 'js', 'jsx', 'ts', 'tsx', 'py', 'php', 'jar', 'apk', 'iso', 'scr'];

const DB_NAME = 'EasySubmitDB';
const STORE_NAME = 'draftFiles';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFilesToDB = async (filesList) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const serializedFiles = await Promise.all(
      filesList.map(async (file) => ({
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        buffer: await file.arrayBuffer()
      }))
    );
    store.put(serializedFiles, 'savedFiles');
  } catch (e) {
    console.error("Failed to save files to IndexedDB", e);
  }
};

const loadFilesFromDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.get('savedFiles');
      request.onsuccess = () => {
        if (request.result && Array.isArray(request.result)) {
          const restored = request.result.map(
            (item) => new File([item.buffer], item.name, { type: item.type, lastModified: item.lastModified })
          );
          resolve(restored);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

const clearFilesFromDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('savedFiles');
  } catch (e) {
    console.error("Failed to clear files from IndexedDB", e);
  }
};

export default function App() {
  const fileInputRef = useRef(null);
  const tokenClientRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('easysubmit_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('easysubmit_token') || null;
  });

  const [myCreatedIds, setMyCreatedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('easysubmit_my_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('easysubmit_settings');
      return saved ? JSON.parse(saved) : {
        autoFormatFilename: false,
        clientCompression: false,
        rateLimiting: false,
        autoExtractZip: false,
        autoLockEnabled: false,
        autoLockMinutes: 15,
        autoUpdateSilent: false,
        biometricLock: false
      };
    } catch {
      return {
        autoFormatFilename: false,
        clientCompression: false,
        rateLimiting: false,
        autoExtractZip: false,
        autoLockEnabled: false,
        autoLockMinutes: 15,
        autoUpdateSilent: false,
        biometricLock: false
      };
    }
  });

  const [historyList, setHistoryList] = useState(() => {
    try {
      const savedUser = localStorage.getItem('easysubmit_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (parsedUser?.email) {
        const localHist = localStorage.getItem(`easysubmit_history_${parsedUser.email.toLowerCase()}`);
        if (localHist) return JSON.parse(localHist);
      }
      const globalHist = localStorage.getItem('easysubmit_global_history');
      return globalHist ? JSON.parse(globalHist) : [];
    } catch {
      return [];
    }
  });

  const [driveInput, setDriveInput] = useState(() => localStorage.getItem('easysubmit_draft_drive_input') || '');
  const [activeFolderId, setActiveFolderId] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState('');
  const [folderContents, setFolderContents] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [isAccessClosed, setIsAccessClosed] = useState(false);

  const [fullName, setFullName] = useState(() => localStorage.getItem('easysubmit_draft_name') || '');
  const [section, setSection] = useState(() => localStorage.getItem('easysubmit_draft_section') || '');
  const [subject, setSubject] = useState(() => localStorage.getItem('easysubmit_draft_subject') || '');
  
  const [submissionType, setSubmissionType] = useState('Assignment');
  const [customSubmissionName, setCustomSubmissionName] = useState('');

  const [files, setFiles] = useState([]);

  const [previewFile, setPreviewFile] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  const [toastNotification, setToastNotification] = useState(null);
  const [updateState, setUpdateState] = useState({ isOpen: false, isForced: false, apkUrl: '' });

  const [pullProgress, setPullProgress] = useState(0);
  const [pullState, setPullState] = useState('idle');
  const touchStartY = useRef(0);

  const triggerNotification = (type, message) => {
    setToastNotification({ type, message });
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    initGoogleAuth();

    if (Capacitor.isNativePlatform()) {
      checkDeviceIntegrity().then((res) => {
        if (res.isEmulator) {
          console.warn("App running inside emulator environment");
        }
      });

      if (settings.biometricLock) {
        setIsAppLocked(true);
      }
    }

    loadFilesFromDB().then((restoredFiles) => {
      if (restoredFiles.length > 0) {
        setFiles(restoredFiles);
      }
    });

    if (Capacitor.isNativePlatform()) {
      const verifyAppVersion = async () => {
        const updateRes = await checkForAppUpdates();
        if (updateRes.hasUpdate) {
          if (settings.autoUpdateSilent) {
            downloadAndInstallApk(updateRes.downloadUrl);
            return;
          }

          let firstDetected = localStorage.getItem('easysubmit_update_first_seen');
          if (!firstDetected) {
            firstDetected = Date.now().toString();
            localStorage.setItem('easysubmit_update_first_seen', firstDetected);
          }

          const elapsedDays = (Date.now() - parseInt(firstDetected, 10)) / (1000 * 60 * 60 * 24);

          if (elapsedDays >= 3) {
            setUpdateState({ isOpen: true, isForced: true, apkUrl: updateRes.downloadUrl });
          } else if (elapsedDays >= 2) {
            setUpdateState({ isOpen: true, isForced: false, apkUrl: updateRes.downloadUrl });
          }
        }
      };

      verifyAppVersion();
    }
  }, [settings.biometricLock, settings.autoUpdateSilent]);

  useEffect(() => {
    localStorage.setItem('easysubmit_draft_name', fullName);
    localStorage.setItem('easysubmit_draft_section', section);
    localStorage.setItem('easysubmit_draft_subject', subject);
    localStorage.setItem('easysubmit_draft_drive_input', driveInput);
  }, [fullName, section, subject, driveInput]);

  useEffect(() => {
    if (files.length > 0) {
      saveFilesToDB(files);
    } else {
      clearFilesFromDB();
    }
  }, [files]);

  const loadFolderItems = useCallback(async (targetId, silent = false) => {
    if (!accessToken || !targetId) return;
    if (!silent) setIsLoadingContents(true);
    try {
      const result = await fetchFolderContents(targetId, accessToken);
      setFolderContents(result.files || []);
      setIsAccessClosed(result.isClosed);
    } catch (err) {
      if (err?.status === 401 || err?.message?.includes('401')) {
        setAccessToken(null);
        localStorage.removeItem('easysubmit_token');
      }
      setIsAccessClosed(false);
    } finally {
      if (!silent) setIsLoadingContents(false);
    }
  }, [accessToken]);

  const handleVerifyFolder = useCallback((folderLinkOrId) => {
    if (!folderLinkOrId) return;
    if (folderLinkOrId.includes('http') && !folderLinkOrId.includes('drive.google.com')) {
      triggerNotification('warning', 'Security Protection: Tanging official Google Drive links lamang ang tinatanggap.');
      return;
    }

    const id = extractFolderId(folderLinkOrId);
    if (!id) return;
    setActiveFolderId(id);
    setCurrentFolderId(id);
    setBreadcrumbs([{ id, name: 'Root Folder' }]);
    setIsAccessClosed(false);
    if (accessToken) {
      loadFolderItems(id);
    }
  }, [accessToken, loadFolderItems]);

  useEffect(() => {
    if (driveInput && accessToken) {
      const id = extractFolderId(driveInput);
      if (id) {
        setActiveFolderId(id);
        setCurrentFolderId(id);
        setBreadcrumbs([{ id, name: 'Root Folder' }]);
        setIsAccessClosed(false);
        loadFolderItems(id);
      }
    }
  }, [driveInput, accessToken, loadFolderItems]);

  useEffect(() => {
    if (isHelpOpen || receiptData || isUploading || isSettingsOpen || isHistoryOpen || isPrivacyOpen || previewFile || updateState.isOpen || isScannerOpen || isAppLocked) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isHelpOpen, receiptData, isUploading, isSettingsOpen, isHistoryOpen, isPrivacyOpen, previewFile, updateState.isOpen, isScannerOpen, isAppLocked]);

  useEffect(() => {
    localStorage.setItem('easysubmit_my_ids', JSON.stringify(myCreatedIds));
  }, [myCreatedIds]);

  useEffect(() => {
    localStorage.setItem('easysubmit_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let isMounted = true;

    const syncHistory = async () => {
      if (!accessToken) return;

      try {
        const cloudData = await fetchCloudHistory(accessToken);
        if (isMounted && Array.isArray(cloudData) && cloudData.length > 0) {
          setHistoryList(cloudData);
          localStorage.setItem('easysubmit_global_history', JSON.stringify(cloudData));
          if (user?.email) {
            localStorage.setItem(`easysubmit_history_${user.email.toLowerCase()}`, JSON.stringify(cloudData));
          }
        }
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes('401')) {
          setAccessToken(null);
          localStorage.removeItem('easysubmit_token');
        }
      }
    };

    syncHistory();
    const interval = setInterval(syncHistory, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [accessToken, user?.email]);

  useEffect(() => {
    if (!accessToken || !settings.autoLockEnabled) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      const timeoutMs = (settings.autoLockMinutes || 15) * 60 * 1000;
      inactivityTimerRef.current = setTimeout(() => {
        handleSignOut();
        triggerNotification('warning', `Session Auto-Locked: Signed out after ${settings.autoLockMinutes || 15} minutes of inactivity.`);
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [accessToken, settings.autoLockEnabled, settings.autoLockMinutes]);

  const saveHistoryItem = async (newItem) => {
    const updated = [newItem, ...historyList];
    setHistoryList(updated);
    localStorage.setItem('easysubmit_global_history', JSON.stringify(updated));
    if (user?.email) {
      localStorage.setItem(`easysubmit_history_${user.email.toLowerCase()}`, JSON.stringify(updated));
    }
    if (accessToken) {
      await saveCloudHistory(updated, accessToken);
    }
  };

  const handleClearHistory = async () => {
    setHistoryList([]);
    localStorage.removeItem('easysubmit_global_history');
    if (user?.email) {
      localStorage.removeItem(`easysubmit_history_${user.email.toLowerCase()}`);
    }
    if (accessToken) {
      await saveCloudHistory([], accessToken);
    }
  };

  const handleDeleteHistoryItem = async (indexToDelete) => {
    const updated = historyList.filter((_, idx) => idx !== indexToDelete);
    setHistoryList(updated);
    localStorage.setItem('easysubmit_global_history', JSON.stringify(updated));
    if (user?.email) {
      localStorage.setItem(`easysubmit_history_${user.email.toLowerCase()}`, JSON.stringify(updated));
    }
    if (accessToken) {
      await saveCloudHistory(updated, accessToken);
    }
  };

  const initGoogleClient = useCallback(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.appdata',
        callback: async (response) => {
          setIsConnectingDrive(false);
          if (response.error) {
            console.error(response);
            triggerNotification('warning', 'Google Auth Connection failed.');
            return;
          }
          if (response.access_token) {
            setAccessToken(response.access_token);
            localStorage.setItem('easysubmit_token', response.access_token);

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
              });
              const userData = await res.json();
              setUser(userData);
              localStorage.setItem('easysubmit_user', JSON.stringify(userData));
            } catch (err) {
              const fallbackUser = { name: 'Connected User' };
              setUser(fallbackUser);
              localStorage.setItem('easysubmit_user', JSON.stringify(fallbackUser));
            }
          }
        },
      });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() && !initGoogleClient()) {
      const interval = setInterval(() => {
        if (initGoogleClient()) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [initGoogleClient]);

  const handleConnectDrive = async (isReconnect = false) => {
    if (isConnectingDrive) return;
    setIsConnectingDrive(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const result = await signInWithGoogle(isReconnect);
        if (result.success) {
          const token = result.accessToken || result.idToken;
          setAccessToken(token);
          localStorage.setItem('easysubmit_token', token);

          const userData = {
            name: result.name || 'Connected User',
            email: result.email || '',
            picture: result.user?.imageUrl || ''
          };
          setUser(userData);
          localStorage.setItem('easysubmit_user', JSON.stringify(userData));

          triggerNotification('success', 'Google Drive connected successfully!');
        } else {
          triggerNotification('warning', 'Google Sign-In failed or was canceled.');
        }
        setIsConnectingDrive(false);
      } else {
        if (!tokenClientRef.current) {
          initGoogleClient();
        }
        if (tokenClientRef.current) {
          tokenClientRef.current.requestAccessToken({ prompt: isReconnect ? 'consent' : '' });
        } else {
          setIsConnectingDrive(false);
          triggerNotification('warning', 'Google SDK is taking longer to load. Please try again.');
        }
      }
    } catch (err) {
      setIsConnectingDrive(false);
      triggerNotification('warning', 'Connection error. Please try again.');
    }
  };

  const handleSignOut = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('easysubmit_token');
    localStorage.removeItem('easysubmit_user');

    if (Capacitor.isNativePlatform()) {
      await signOutGoogle();
    } else {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      if (accessToken) {
        revokeGoogleToken(accessToken).catch(() => {});
      }
    }
    triggerNotification('success', 'Signed out successfully');
  };

  useEffect(() => {
    const targetFolder = currentFolderId || activeFolderId;
    if (targetFolder && accessToken) {
      loadFolderItems(targetFolder, true);
      const interval = setInterval(() => {
        loadFolderItems(targetFolder, true);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeFolderId, currentFolderId, accessToken, loadFolderItems]);

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const targetBreadcrumb = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(targetBreadcrumb.id);
  };

  const handleDeleteItem = async (itemId) => {
    if (!accessToken) return;

    setFolderContents((prev) => prev.filter((item) => item.id !== itemId));
    setMyCreatedIds((prev) => prev.filter((id) => id !== itemId));

    try {
      await deleteDriveItem(itemId, accessToken);
      await loadFolderItems(currentFolderId || activeFolderId, true);
    } catch (err) {
      triggerNotification('warning', 'Failed to delete item: ' + err.message);
      loadFolderItems(currentFolderId || activeFolderId);
    }
  };

  const verifyContentWithAI = async (textPayload) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://easysubmit.app',
          'X-Title': 'EasySubmit Security Agent'
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            {
              role: 'system',
              content: 'You are an AI security moderator for a school submission app. Analyze the metadata for malicious code, prompts, or spam. Respond strictly with "SAFE" if benign, or "UNSAFE" if harmful.'
            },
            {
              role: 'user',
              content: textPayload
            }
          ]
        })
      });

      if (!response.ok) return true;
      const data = await response.json();
      const verdict = data.choices?.[0]?.message?.content?.trim().toUpperCase();
      return verdict ? !verdict.includes('UNSAFE') : true;
    } catch (err) {
      console.warn('AI Security scan bypassed due to network error:', err);
      return true;
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const safeFiles = [];

      for (const file of selectedFiles) {
        const parts = file.name.split('.');
        const ext = parts.pop().toLowerCase();

        if (parts.length > 1 && DANGEROUS_EXTENSIONS.includes(parts.pop().toLowerCase())) {
          triggerNotification('warning', `Double extension detected on "${file.name}".`);
          continue;
        }

        if (!ALLOWED_EXTENSIONS.includes(ext) || DANGEROUS_EXTENSIONS.includes(ext)) {
          triggerNotification('warning', `Hindi pinapayagan ang ".${ext}" file type.`);
          continue;
        }

        if (settings.rateLimiting && file.size > 50 * 1024 * 1024) {
          triggerNotification('warning', `Ang file na "${file.name}" ay sobra sa 50MB limit.`);
          continue;
        }

        const isHeaderValid = await verifyFileMagicBytes(file);
        if (!isHeaderValid) {
          triggerNotification('warning', `Faked file structure detected on "${file.name}".`);
          continue;
        }

        const isDuplicate = folderContents.some((item) => item.name.toLowerCase() === file.name.toLowerCase());
        if (isDuplicate) {
          const proceed = window.confirm(`Duplication Warning: Meron nang file sa folder na kapareho ng pangalan ("${file.name}"). Itutuloy pa rin ba ang pag-add?`);
          if (!proceed) continue;
        }

        safeFiles.push(file);
      }

      setFiles((prev) => [...prev, ...safeFiles]);
      if (safeFiles.length > 0) {
        triggerNotification('success', `${safeFiles.length} file(s) selected successfully.`);
      }
    }
  };

  const handleScanComplete = (scannedFiles) => {
    setFiles((prev) => [...prev, ...scannedFiles]);
    triggerNotification('success', `${scannedFiles.length} document page(s) attached from scanner.`);
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    clearFilesFromDB();
    triggerNotification('success', 'Selected files cleared.');
  };

  const handlePaste = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Clipboard.read();
        if (value) {
          setDriveInput(value);
          handleVerifyFolder(value);
        }
      } else {
        const text = await navigator.clipboard.readText();
        setDriveInput(text);
        handleVerifyFolder(text);
      }
    } catch (err) {
      triggerNotification('warning', 'Cannot access clipboard. Please paste manually into the input box.');
    }
  };

  const handleClearDriveInput = () => {
    setDriveInput('');
    setActiveFolderId('');
    setCurrentFolderId('');
    setFolderContents([]);
    setBreadcrumbs([]);
    setIsAccessClosed(false);
  };

  const handleTouchStart = (e) => {
    if (Capacitor.isNativePlatform() && window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (Capacitor.isNativePlatform() && window.scrollY === 0 && pullState !== 'refreshing') {
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY.current;
      if (diff > 0) {
        const prog = Math.min(diff / 120, 1);
        setPullProgress(prog);
        setPullState(prog >= 1 ? 'ready' : 'pulling');
      }
    }
  };

  const handleTouchEnd = () => {
    if (!Capacitor.isNativePlatform()) return;
    if (pullProgress >= 0.8) {
      setPullState('refreshing');
      const targetFolder = currentFolderId || activeFolderId;
      if (targetFolder && accessToken) {
        loadFolderItems(targetFolder);
      }
      setTimeout(() => {
        setPullState('success');
        setTimeout(() => {
          setPullState('idle');
          setPullProgress(0);
        }, 800);
      }, 1000);
    } else {
      setPullState('idle');
      setPullProgress(0);
    }
  };

  const categories = [
    { id: 'None', title: 'None', sub: '(Direct to Name Folder)', icon: MinusCircle },
    { id: 'Assignment', title: 'Assignment', sub: '/ Assignments', icon: BookOpen },
    { id: 'Activity', title: 'Activity / Worksheet', sub: '/ Activities', icon: FileCheck },
    { id: 'Project', title: 'Project / PETA', sub: '/ Projects', icon: Package },
  ];

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      triggerNotification('warning', 'Please connect your Google Drive account first.');
      return;
    }

    if (!activeFolderId) {
      triggerNotification('warning', 'Please enter or verify a valid Google Drive link first.');
      return;
    }

    if (files.length === 0) {
      triggerNotification('warning', 'Please select at least one file to submit.');
      return;
    }

    if (!navigator.onLine) {
      addToOfflineQueue({ fullName, section, subject, submissionType, customSubmissionName, files });
      triggerNotification('warning', 'Offline Mode: Saved to upload queue. Will submit when back online.');
      if (Capacitor.isNativePlatform()) {
        triggerLocalNotification("EasySubmit Offline Queue", "Submission saved. Will upload automatically when connected.");
      }
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setCompletedCount(0);

    const allFilesToUpload = [...files];
    const createdIdsThisSession = [];

    try {
      const metadataPayload = `Student: ${fullName} | Section: ${section} | CustomName: ${customSubmissionName} | Files: ${allFilesToUpload.map(f => f.name).join(', ')}`;
      const isAISafe = await verifyContentWithAI(metadataPayload);

      if (!isAISafe) {
        setIsUploading(false);
        triggerNotification('warning', 'AI Guardrail Warning: Naharang ang iyong submission ng AI Security Scanner.');
        return;
      }

      let targetFolderId = activeFolderId;
      const cleanFullName = sanitizeString(fullName);
      const cleanSection = sanitizeString(section);
      const cleanCustomName = sanitizeString(customSubmissionName);

      const finalFolderName = cleanCustomName || submissionType;

      if (accessToken) {
        const studentLabel = cleanFullName || 'Student Name';
        const studentFolderName = cleanSection
          ? `[${cleanSection}] ${studentLabel}`
          : studentLabel;

        const studentFolder = await createDriveFolder(studentFolderName, activeFolderId, accessToken);
        if (studentFolder?.id) createdIdsThisSession.push(studentFolder.id);

        if (submissionType === 'None' && !cleanCustomName) {
          targetFolderId = studentFolder.id;
        } else {
          const submissionFolder = await createDriveFolder(finalFolderName, studentFolder.id, accessToken);
          if (submissionFolder?.id) createdIdsThisSession.push(submissionFolder.id);
          targetFolderId = submissionFolder.id;
        }
      }

      const uploadedResults = [];
      for (let i = 0; i < allFilesToUpload.length; i++) {
        const file = allFilesToUpload[i];
        setCurrentUploadingFile(file.name);
        setUploadProgress(1);

        let uploadName = file.name;
        if (settings.autoFormatFilename) {
          const ext = file.name.split('.').pop();
          const label = cleanSection ? `[${cleanSection}] ` : '';
          uploadName = `${label}${cleanFullName || 'Student'} - ${finalFolderName}.${ext}`;
        }

        let result = { name: uploadName };
        if (accessToken) {
          result = await uploadFileToDrive(file, targetFolderId, accessToken, uploadName, (percent) => {
            setUploadProgress(percent);
          });
          if (result?.id) createdIdsThisSession.push(result.id);
        }
        uploadedResults.push(result);
        setCompletedCount(i + 1);
      }

      setMyCreatedIds((prev) => [...prev, ...createdIdsThisSession]);

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newReceipt = {
        receiptId: `ES-${dateStr}-${randomStr}`,
        fullName: cleanFullName,
        section: cleanSection || 'N/A',
        submissionType: submissionType === 'None' && !cleanCustomName ? 'Direct Upload' : finalFolderName,
        timestamp: new Date().toLocaleString(),
        files: uploadedResults,
        folderUrl: `https://drive.google.com/drive/folders/${targetFolderId}`,
      };

      setReceiptData(newReceipt);
      await saveHistoryItem(newReceipt);

      if (Capacitor.isNativePlatform()) {
        triggerLocalNotification("EasySubmit Submission Success", `Uploaded ${uploadedResults.length} file(s) to Google Drive.`);
      }

      setFiles([]);
      await clearFilesFromDB();
      localStorage.removeItem('easysubmit_draft_name');
      localStorage.removeItem('easysubmit_draft_section');
      localStorage.removeItem('easysubmit_draft_subject');

      if (accessToken && (currentFolderId || activeFolderId)) {
        loadFolderItems(currentFolderId || activeFolderId);
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const hasFormDraft = Boolean(fullName.trim() || section.trim() || subject.trim() || files.length > 0);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen w-full bg-[#050814] text-white flex flex-col font-sans relative overflow-x-hidden select-none"
    >
      <BiometricLockScreen
        isOpen={isAppLocked}
        onUnlockSuccess={() => setIsAppLocked(false)}
      />

      <NetworkModal />
      <NotificationToast notification={toastNotification} onClose={() => setToastNotification(null)} />
      {Capacitor.isNativePlatform() && (
        <UpdateModal
          isOpen={updateState.isOpen}
          isForced={updateState.isForced}
          onConfirm={() => downloadAndInstallApk(updateState.apkUrl)}
          onCancel={() => setUpdateState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {Capacitor.isNativePlatform() && pullState !== 'idle' && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none transition-all duration-200">
          <div className="w-12 h-1 bg-slate-700/50 rounded-full mb-3" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-600/30 to-cyan-500/10 border border-cyan-400/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            {pullState === 'pulling' && (
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full" style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
            )}
            {pullState === 'ready' && (
              <RefreshCw className="w-5 h-5 text-cyan-300 animate-spin" />
            )}
            {pullState === 'refreshing' && (
              <RefreshCw className="w-5 h-5 text-cyan-300 animate-spin" />
            )}
            {pullState === 'success' && (
              <div className="flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      <Header
        accessToken={accessToken}
        user={user}
        onConnectDrive={() => handleConnectDrive(false)}
        onSignOut={handleSignOut}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl">
          <div className="space-y-2">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button type="button" onClick={() => setIsHistoryOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-semibold rounded-2xl text-xs transition">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Submission History</span>
            </button>
            <button type="button" onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-semibold rounded-2xl text-xs transition">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Settings & Controls</span>
            </button>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protected Portal</span>
            </p>
          </div>
        </aside>

        <main className="lg:col-span-6 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/60 via-indigo-900/40 to-purple-900/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(37,99,235,0.25)]">
            <div className="relative z-10 max-w-lg space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-cyan-300 text-[11px] font-bold rounded-full">
                <span>⚡ Fast, Multi-Device Responsive Submissions Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Submit Homework <br /> Directly to Google Drive
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste the teacher's folder link, enter your name & section, and EasySubmit will organize your personal folder and upload your files directly to Drive.
              </p>
            </div>
            <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 rounded-full blur-sm opacity-80 animate-pulse hidden sm:block pointer-events-none" />
          </div>

          <form onSubmit={handleSubmission} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-cyan-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shadow-md">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Student & Submission Info</h3>
                    <p className="text-[11px] text-slate-400">EasySubmit creates your personal folder using your info</p>
                  </div>
                </div>
                {hasFormDraft && (
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                    <Save className="w-3 h-3" /> Auto-Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">👤 Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">🎓 Class Section / Year (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BSBA MM 3A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">📖 Subject / Subject Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. GGASR"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-2">What are you submitting?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {categories.map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = submissionType === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSubmissionType(cat.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-200 active:scale-95 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/30 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400'
                              : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <IconComp className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cat.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{cat.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-cyan-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shadow-md">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Submission Title / Activity Name (Optional)</h3>
                </div>
              </div>
              <input
                type="text"
                placeholder={`e.g. ${submissionType === 'None' ? 'Activity Name' : submissionType} 1 - Midterm Essay`}
                value={customSubmissionName}
                onChange={(e) => setCustomSubmissionName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-xs shadow-md">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Select School Files</h3>
                    <p className="text-[11px] text-slate-400">Drag & drop or tap to choose files from your device</p>
                  </div>
                </div>

                {Capacitor.isNativePlatform() && (
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan Paper / Doc</span>
                  </button>
                )}
              </div>

              <div 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="border-2 border-dashed border-blue-500/40 hover:border-cyan-400 rounded-3xl p-6 text-center space-y-3 bg-slate-900/40 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Drag and drop your files here</p>
                  <p className="text-[11px] text-cyan-400 hover:underline">or browse from your device / storage</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {['PDF', 'DOCX', 'PPTX', 'JPG / PNG', 'XLSX', 'TXT'].map((ext) => (
                    <span key={ext} className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-mono border border-white/5">
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">Selected Files ({files.length})</span>
                    <button type="button" onClick={handleClearAllFiles} className="text-red-400 hover:underline font-semibold text-[11px]">Clear All</button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/90 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span className="truncate font-medium text-slate-200">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setPreviewFile(file)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition" title="Preview File">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition" title="Remove File">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeFolderId && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Folder Submissions ({folderContents.length})
                  </span>
                  {accessToken && (
                    <button type="button" onClick={() => loadFolderItems(currentFolderId || activeFolderId)} className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                      <RefreshCw className={`w-3 h-3 ${isLoadingContents ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  )}
                </div>
                <FolderExplorer
                  folderContents={folderContents}
                  currentFolderId={currentFolderId || activeFolderId}
                  rootFolderId={activeFolderId}
                  breadcrumbs={breadcrumbs}
                  onBreadcrumbClick={handleBreadcrumbClick}
                  onFolderClick={handleFolderClick}
                  onDeleteItem={handleDeleteItem}
                  isLoading={isLoadingContents}
                  myCreatedIds={myCreatedIds}
                  currentUserEmail={user?.email}
                  isAccessClosed={isAccessClosed}
                />
              </div>
            )}
          </form>
        </main>

        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  Google Drive Status
                  <span className={`w-2 h-2 rounded-full ${accessToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                </p>
                <p className="text-[11px] text-slate-400 truncate">{accessToken ? 'Linked & ready' : 'Not Connected'}</p>
              </div>
            </div>
            {!accessToken && (
              <button
                type="button"
                disabled={isConnectingDrive}
                onClick={() => handleConnectDrive(true)}
                className="w-full py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isConnectingDrive ? 'animate-spin' : ''}`} />
                <span>{isConnectingDrive ? 'Connecting...' : 'Connect Drive'}</span>
              </button>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl space-y-3">
            <p className="text-xs font-bold text-white">Teacher's Link</p>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                value={driveInput}
                onChange={(e) => {
                  setDriveInput(e.target.value);
                  handleVerifyFolder(e.target.value);
                }}
                className="w-full pl-3 pr-24 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-400 transition"
              />
              <div className="absolute right-1 flex items-center gap-1">
                {driveInput && (
                  <button
                    type="button"
                    onClick={handleClearDriveInput}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg text-xs transition"
                    title="Clear Link"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <ClipboardIcon className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl space-y-3 text-xs">
            <p className="font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              Folder Structure Preview:
            </p>
            <div className="pl-2 space-y-1 font-mono text-[11px]">
              <p className="text-slate-400">Teacher's Drive &gt;</p>
              <p className="text-cyan-300 pl-3">📁 {section.trim() ? `[${section.trim()}] ` : ''}{fullName || 'Student Name'}</p>
              {(submissionType !== 'None' || customSubmissionName.trim()) && (
                <p className="text-blue-400 pl-6">📁 {customSubmissionName.trim() || submissionType}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmission}
            disabled={!accessToken}
            className={`w-full py-4 font-black rounded-3xl text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 ${
              accessToken
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white cursor-pointer hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]'
                : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{accessToken ? 'Submit to Google Drive' : 'Connect Drive to Submit'}</span>
          </button>
        </aside>

      </div>

      <footer className="w-full text-center py-6 text-xs text-slate-400 border-t border-white/5 relative z-10 space-y-2 select-none">
        <p>EasySubmit • Direct School Submission Portal</p>
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Privacy Policy & Terms
          </button>
          <span className="text-slate-600">•</span>
          <a
            href="https://www.facebook.com/arnelcoraldeMA"
            target="_blank"
            rel="noopener noreferrer"
            draggable="false"
            className="text-cyan-400 hover:underline font-semibold select-none inline-block touch-manipulation pointer-events-auto"
          >
            Created By NatsumiKieko
          </a>
        </div>
      </footer>

      <UploadProgressModal
        isOpen={isUploading}
        currentFileName={currentUploadingFile}
        progressPercentage={uploadProgress}
        completedCount={completedCount}
        totalFiles={files.length}
        error={uploadError}
      />
      <SubmissionReceiptModal receiptData={receiptData} onClose={() => setReceiptData(null)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onToggleSetting={(key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
        onUpdateSetting={(key, val) => setSettings((prev) => ({ ...prev, [key]: val }))}
        historyList={historyList}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        currentUserEmail={user?.email}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        currentUserEmail={user?.email}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}