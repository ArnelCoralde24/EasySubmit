// Google Drive API v3 Endpoints & Helper Functions

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Extract Google Drive Folder ID mula sa iba't ibang Link Format
export const extractFolderId = (urlOrId) => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  
  // Format: https://drive.google.com/drive/folders/FOLDER_ID
  const matchFolders = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolders && matchFolders[1]) return matchFolders[1];

  // Format: https://drive.google.com/drive/u/0/folders/FOLDER_ID
  const matchUserFolders = trimmed.match(/\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (matchUserFolders && matchUserFolders[1]) return matchUserFolders[1];

  // Direct ID check
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

  return '';
};

// Mag-fetch ng listahan ng files/folders sa loob ng target Drive Folder
export const fetchFolderContents = async (folderId, accessToken) => {
  const query = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, createdTime, size)';
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&includeItemsFromAllDrives=true&supportsAllDrives=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch folder contents');
  }

  const data = await response.json();
  return data.files || [];
};

// Lumikha ng Bagong Subfolder sa Loob ng Parent Folder
export const createDriveFolder = async (folderName, parentFolderId, accessToken) => {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const response = await fetch(`${DRIVE_API_BASE}/files?supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create subfolder');
  }

  return await response.json();
};

// I-upload ang Bawat File Direkta sa Google Drive
export const uploadFileToDrive = async (file, parentFolderId, accessToken, onProgress) => {
  const metadata = {
    name: file.name,
    parents: [parentFolderId],
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${UPLOAD_API_BASE}/files?uploadType=multipart&supportsAllDrives=true`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        resolve(res);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during file upload'));
    xhr.send(formData);
  });
};