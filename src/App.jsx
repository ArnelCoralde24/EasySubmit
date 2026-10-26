import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, UploadCloud, Send, Link2, Clipboard, X,
  BookOpen, FileCheck, Package, ExternalLink, ShieldAlert,
  FileText, Trash2, Edit3, Users, RefreshCw, MinusCircle, Home,
  FolderOpen, HardDrive, User, Lock, ShieldCheck
} from "lucide-react";
import FolderExplorer from "./components/FolderExplorer";
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
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'rar'];

export default function App() {
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
  
  const [submissionType, setSubmissionType] = useState('Assignment');
  const [customSubmissionName, setCustomSubmissionName] = useState('');

  const [files, setFiles] = useState([]);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isHelpOpen || receiptData || isUploading) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isHelpOpen, receiptData, isUploading]);

  useEffect(() => {
    localStorage.setItem('easysubmit_my_ids', JSON.stringify(myCreatedIds));
  }, [myCreatedIds]);

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
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
      alert('Google SDK script is loading. Please try again.');
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
      alert('Failed to delete item: ' + err.message);
      loadFolderItems(currentFolderId || activeFolderId);
    }
  };

  const handleAddFilesToFolder = async (filesToAdd, targetFolderId) => {
    if (!accessToken || !targetFolderId) return;

    for (const file of filesToAdd) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        alert(`Security Alert: Ang file extension na ".${ext}" ay nakaharang dahil sa virus risk. Paki-upload lamang ang mga safe school documents/images.`);
        return;
      }
    }

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
      const safeFiles = [];

      for (const file of selectedFiles) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          alert(`Security Warning: Hindi pinapayagan ang ".${ext}" file type para maiwasan ang virus.`);
        } else {
          safeFiles.push(file);
        }
      }

      setFiles((prev) => [...prev, ...safeFiles]);
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
      alert('Clipboard permission required.');
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
    if (folderLinkOrId.includes('http') && !folderLinkOrId.includes('drive.google.com')) {
      alert('Security Protection: Tanging official Google Drive links lamang (https://drive.google.com) ang tinatanggap.');
      return;
    }

    const id = extractFolderId(folderLinkOrId);
    if (!id) return;
    setActiveFolderId(id);
    setCurrentFolderId(id);
    setBreadcrumbs([{ id, name: 'Root Folder' }]);
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
      alert('Please connect your Google Drive account first.');
      return;
    }

    if (!activeFolderId) {
      alert('Please enter or verify a valid Google Drive link first.');
      return;
    }

    if (files.length === 0) {
      alert('Please select at least one file to submit.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setCompletedCount(0);

    const allFilesToUpload = [...files];
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

      if (accessToken && (currentFolderId || activeFolderId)) {
        loadFolderItems(currentFolderId || activeFolderId);
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050814] text-white flex flex-col font-sans relative overflow-x-hidden select-none">
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-lg text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            ES
          </div>
          <span className="font-black text-xl tracking-tight text-white flex items-center gap-2">
            EasySubmit
            <ShieldCheck className="w-4 h-4 text-emerald-400" title="Protected by Maximum Security Protocol" />
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md">
          <button type="button" className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button type="button" onClick={() => setIsHelpOpen(true)} className="px-4 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 hover:bg-white/5 transition">
            <BookOpen className="w-4 h-4" />
            <span>How It Works</span>
          </button>
          <a href={`https://drive.google.com/drive/folders/${currentFolderId || activeFolderId || ''}`} target="_blank" rel="noreferrer" className="px-4 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 hover:bg-white/5 transition">
            <FolderOpen className="w-4 h-4" />
            <span>Drive</span>
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {accessToken ? (
            <div className="flex items-center gap-2.5 bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold truncate max-w-[100px] sm:max-w-none">{user?.name || 'Connected'}</span>
              <button type="button" onClick={handleSignOut} className="text-[10px] text-red-400 hover:underline font-bold ml-1">Sign Out</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectDrive}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Connect Drive</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl">
          <div className="space-y-2">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button type="button" onClick={() => setIsHelpOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-semibold rounded-2xl text-xs transition">
              <BookOpen className="w-4 h-4" />
              <span>Submit Homework</span>
            </button>
            <a href={`https://drive.google.com/drive/folders/${currentFolderId || activeFolderId || ''}`} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-semibold rounded-2xl text-xs transition">
              <HardDrive className="w-4 h-4" />
              <span>Google Drive</span>
            </a>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protected Portal</span>
            </p>
            <p className="text-slate-300 text-[11px]">Maximum Anti-Virus & Code Protection Active.</p>
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-cyan-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shadow-md">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Student & Submission Info</h3>
                  <p className="text-[11px] text-slate-400">EasySubmit creates your personal folder using your info</p>
                </div>
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-xs shadow-md">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Select School Files</h3>
                  <p className="text-[11px] text-slate-400">Drag & drop or tap to choose files from your device</p>
                </div>
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
                    <button type="button" onClick={() => setFiles([])} className="text-red-400 hover:underline font-semibold text-[11px]">Clear All</button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/90 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span className="truncate font-medium text-slate-200">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1 text-slate-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  onAddFilesToFolder={handleAddFilesToFolder}
                  isLoading={isLoadingContents}
                  myCreatedIds={myCreatedIds}
                  currentUserEmail={user?.email}
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
                onClick={handleConnectDrive}
                className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/30 rounded-xl text-xs font-bold transition"
              >
                Reconnect Drive
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
                  <Clipboard className="w-3 h-3" />
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

      <footer className="w-full text-center py-6 text-xs text-slate-400 border-t border-white/5 relative z-10">
        <p>EasySubmit • Direct School Submission Portal</p>
        <a
          href="https://www.facebook.com/arnelcoraldeMA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-cyan-400 hover:underline font-semibold"
        >
          Created By NatsumiKieko
        </a>
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
    </div>
  );
}