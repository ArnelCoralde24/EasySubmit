import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, UploadCloud, Send, CheckCircle2, Link2, Clipboard, X,
  BookOpen, Stethoscope, FileCheck, Package, ExternalLink, ShieldAlert, History,
  FileText, Trash2, Edit3, Users, RefreshCw, MinusCircle
} from "lucide-react";
import Header from "./components/Header";
import FolderExplorer from "./components/FolderExplorer";
import LOAModal from './components/LOAModal';
import UploadProgressModal from './components/UploadProgressModal';
import SubmissionReceiptModal from './components/SubmissionReceiptModal';
import HelpModal from './components/HelpModal';
import { 
  extractFolderId, 
  fetchFolderContents, 
  createDriveFolder, 
  uploadFileToDrive, 
  deleteDriveItem 
} from './services/driveService';

const GOOGLE_CLIENT_ID = "431007270977-j9h45it3o6fclmko97tttuioovqgb9m0.apps.googleusercontent.com";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const fileInputRef = useRef(null);
  const tokenClientRef = useRef(null);

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('easysubmit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return sessionStorage.getItem('easysubmit_token') || null;
  });

  const [myCreatedIds, setMyCreatedIds] = useState(() => {
    const saved = localStorage.getItem('easysubmit_my_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [driveInput, setDriveInput] = useState('');
  const [activeFolderId, setActiveFolderId] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState('');
  const [folderContents, setFolderContents] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);

  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [submissionType, setSubmissionType] = useState('Assignment');
  const [customSubmissionName, setCustomSubmissionName] = useState('');

  const [files, setFiles] = useState([]);
  const [loaData, setLoaData] = useState(null);

  const [isLoaModalOpen, setIsLoaModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    localStorage.setItem('easysubmit_my_ids', JSON.stringify(myCreatedIds));
  }, [myCreatedIds]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.error) {
            console.error(response);
            alert('Google Auth Connection failed.');
            return;
          }
          if (response.access_token) {
            setAccessToken(response.access_token);
            sessionStorage.setItem('easysubmit_token', response.access_token);

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
              });
              const userData = await res.json();
              setUser(userData);
              sessionStorage.setItem('easysubmit_user', JSON.stringify(userData));
            } catch (err) {
              const fallbackUser = { name: 'Connected User' };
              setUser(fallbackUser);
              sessionStorage.setItem('easysubmit_user', JSON.stringify(fallbackUser));
            }
          }
        },
      });
    }
  }, []);

  const handleConnectDrive = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    } else {
      alert('Google SDK script is still loading. Please try again in a moment.');
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('easysubmit_token');
    sessionStorage.removeItem('easysubmit_user');
  };

  const loadFolderItems = async (targetId, silent = false) => {
    if (!accessToken || !targetId) return;
    if (!silent) setIsLoadingContents(true);
    try {
      const items = await fetchFolderContents(targetId, accessToken);
      setFolderContents(items || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoadingContents(false);
    }
  };

  useEffect(() => {
    const targetFolder = currentFolderId || activeFolderId;
    if (targetFolder && accessToken) {
      loadFolderItems(targetFolder);

      const interval = setInterval(() => {
        loadFolderItems(targetFolder, true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeFolderId, currentFolderId, accessToken]);

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
      alert('Failed to delete item from Google Drive: ' + err.message);
      loadFolderItems(currentFolderId || activeFolderId);
    }
  };

  const handleAddFilesToFolder = async (filesToAdd, targetFolderId) => {
    if (!accessToken || !targetFolderId) return;

    setIsUploading(true);
    setUploadError('');
    setCompletedCount(0);

    const newlyCreated = [];

    try {
      for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i];
        setCurrentUploadingFile(file.name);
        setUploadProgress(0);

        const result = await uploadFileToDrive(file, targetFolderId, accessToken, (percent) => {
          setUploadProgress(percent);
        });

        if (result?.id) newlyCreated.push(result.id);
        setCompletedCount(i + 1);
      }

      setMyCreatedIds((prev) => [...prev, ...newlyCreated]);
      await loadFolderItems(targetFolderId);
    } catch (err) {
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDriveInput(text);
      handleVerifyFolder(text);
    } catch (err) {
      alert('Clipboard permission is required by your browser.');
    }
  };

  const handleClearDriveInput = () => {
    setDriveInput('');
    setActiveFolderId('');
    setCurrentFolderId('');
    setFolderContents([]);
    setBreadcrumbs([]);
  };

  const handleVerifyFolder = async (folderLinkOrId) => {
    const id = extractFolderId(folderLinkOrId);
    if (!id) return;
    setActiveFolderId(id);
    setCurrentFolderId(id);
    setBreadcrumbs([{ id, name: 'Root Folder' }]);
  };

  const categories = [
    { id: 'None', title: 'None (Direct to Name Folder)', sub: 'Direct upload to student folder', icon: MinusCircle },
    { id: 'Assignment', title: 'Assignment', sub: '/Assignments', icon: BookOpen },
    { id: 'LOA Form', title: 'LOA / Excuse Letter', sub: '/LOA (Letter of Absenc...', icon: Stethoscope },
    { id: 'Activity', title: 'Activity / Worksheet', sub: '/Activities', icon: FileCheck },
    { id: 'Project', title: 'Project / PETA', sub: '/Projects', icon: Package },
  ];

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!activeFolderId) {
      alert('Please enter or verify a valid Google Drive link first.');
      return;
    }

    if (files.length === 0 && !loaData?.generatedFile) {
      alert('Please select at least one file to submit.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setCompletedCount(0);

    const allFilesToUpload = [...files];
    if (loaData?.generatedFile) {
      allFilesToUpload.unshift(loaData.generatedFile);
    }

    const createdIdsThisSession = [];

    try {
      let targetFolderId = activeFolderId;
      const finalFolderName = customSubmissionName.trim() || submissionType;

      if (accessToken) {
        const studentLabel = fullName.trim() || 'Student Name';
        const studentFolderName = section.trim()
          ? `[${section.trim()}] ${studentLabel}`
          : studentLabel;

        const studentFolder = await createDriveFolder(studentFolderName, activeFolderId, accessToken);
        if (studentFolder?.id) createdIdsThisSession.push(studentFolder.id);

        if (submissionType === 'None' && !customSubmissionName.trim()) {
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
        setUploadProgress(0);

        let result = { name: file.name };
        if (accessToken) {
          result = await uploadFileToDrive(file, targetFolderId, accessToken, (percent) => {
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

      setReceiptData({
        receiptId: `ES-${dateStr}-${randomStr}`,
        fullName,
        section: section.trim() || 'N/A',
        submissionType: submissionType === 'None' && !customSubmissionName.trim() ? 'Direct Upload' : finalFolderName,
        timestamp: new Date().toLocaleString(),
        files: uploadedResults,
        folderUrl: `https://drive.google.com/drive/folders/${targetFolderId}`,
      });

      setFiles([]);
      setLoaData(null);

      if (accessToken && (currentFolderId || activeFolderId)) {
        loadFolderItems(currentFolderId || activeFolderId);
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 ease-out will-change-transform">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onSignIn={handleConnectDrive}
        onSignOut={handleSignOut}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full transform-gpu transition-all duration-300 hover:scale-105">
            <span>✨ Fast, Multi-Device Responsive Submissions Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Submit Homework & LOA <br /> Directly to Google Drive
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Paste the teacher's folder link, enter your name & section, and EasySubmit will organize your personal folder and upload your files directly to Drive.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 transform-gpu transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center text-amber-500 flex-shrink-0">
              <span className="font-extrabold text-sm">G</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Google Drive Status:</span>
                <span className={`text-xs font-bold ${accessToken ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {accessToken ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {accessToken 
                  ? `Connected as: ${user?.name || user?.email || 'Google User'}`
                  : 'Click the "Connect Drive" button in the top header bar to sign in.'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Teacher's Google Drive Link</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Paste the folder link shared by your teacher</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => {
                const demo = "https://drive.google.com/drive/folders/1FS6qxRC7txbzYYmDemoId";
                setDriveInput(demo);
                handleVerifyFolder(demo);
              }}
              className="px-2.5 py-1 bg-blue-500/10 dark:bg-blue-900/30 hover:bg-blue-500/20 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all duration-200"
            >
              ✨ Demo Link
            </button>
          </div>

          <div className="relative flex items-center">
            <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={driveInput}
              onChange={(e) => {
                setDriveInput(e.target.value);
                handleVerifyFolder(e.target.value);
              }}
              className="w-full pl-9 pr-36 py-2.5 bg-white dark:bg-emerald-950/20 border border-slate-300 dark:border-emerald-500/40 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all duration-200"
            />

            <div className="absolute right-1.5 flex items-center gap-1">
              {driveInput && (
                <button
                  type="button"
                  onClick={handleClearDriveInput}
                  className="px-2 py-1.5 bg-slate-200 dark:bg-slate-800/80 hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePaste}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          {activeFolderId && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Drive Folder Detected</span>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80">🔒 Ready for uploads</p>
            </div>
          )}
        </div>

        {activeFolderId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  Folder Submissions & Subfolders ({folderContents.length})
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
              </div>

              {accessToken && (
                <button
                  type="button"
                  onClick={() => loadFolderItems(currentFolderId || activeFolderId)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingContents ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
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
              onAddFilesToFolder={handleAddFilesToFolder}
              isLoading={isLoadingContents}
              myCreatedIds={myCreatedIds}
            />

            <div className="text-right">
              <a
                href={`https://drive.google.com/drive/folders/${currentFolderId || activeFolderId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors duration-200"
              >
                <span>Open full folder in Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmission} className="space-y-6">
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student & Submission Info</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">EasySubmit creates your personal folder using your info</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">👤 Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Format: Last Name, First Name</span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">🏫 Class Section / Year (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BSBA MM 3A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">📖 Subject / Subject Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GGASR"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="pt-2">
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-2">What are you submitting?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = submissionType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSubmissionType(cat.id);
                          if (cat.id === 'LOA Form') setIsLoaModalOpen(true);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transform-gpu transition-all duration-200 active:scale-98 ${
                          isSelected
                            ? 'bg-blue-500/10 dark:bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <div>
                          <p className={`font-bold text-xs ${isSelected ? 'text-blue-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {cat.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{cat.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Submission Title / Activity Name (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${submissionType === 'None' ? 'Activity Name' : submissionType} 1 - Midterm Essay`}
                  value={customSubmissionName}
                  onChange={(e) => setCustomSubmissionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="p-3 bg-slate-200/50 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-white/5 space-y-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Folder Structure That Will Be Created in Drive:
                </span>
                <div className="pl-2 space-y-1 font-mono text-[11px]">
                  <p className="text-slate-500 dark:text-slate-400">Teacher's Drive &gt;</p>
                  <p className="text-blue-600 dark:text-blue-300 pl-3">
                    📁 {section.trim() ? `[${section.trim()}] ` : ''}{fullName || 'Student Name'}
                  </p>
                  {(submissionType !== 'None' || customSubmissionName.trim()) && (
                    <p className="text-blue-500 dark:text-blue-400 pl-6">
                      📁 {customSubmissionName.trim() || submissionType}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select School Files</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Drag & drop or tap to choose files from your device</p>
              </div>
            </div>

            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 relative bg-white/50 dark:bg-slate-900/40 cursor-pointer transform-gpu transition-all duration-200 hover:scale-[1.01]"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Drag and drop your assignments here</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">or browse from your phone / storage</p>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {['PDF', 'DOCX', 'PPTX', 'JPG / PNG', 'XLSX', 'TXT'].map((ext) => (
                  <span key={ext} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-mono border border-slate-300 dark:border-white/5">
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Selected Files ({files.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-[11px] text-red-500 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-sm transform-gpu transition-all duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 active:scale-98 transform-gpu transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <span>Submit to Google Drive</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <footer className="text-center space-y-1.5 pt-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-600 dark:text-slate-400">EasySubmit • Direct School & LOA Submission Portal</p>
          <p className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/5 rounded-full text-[11px]">
            Created By NatsumiKieko
          </p>
        </footer>

      </main>

      <LOAModal
        isOpen={isLoaModalOpen}
        onClose={() => setIsLoaModalOpen(false)}
        onSave={(data) => setLoaData(data)}
        studentInfo={{ fullName, section, studentId, subject }}
      />
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
    </div>
  );
}