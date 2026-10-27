const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

const MAGIC_NUMBERS = {
  pdf: ['25504446'],
  png: ['89504e47'],
  jpg: ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  jpeg: ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  zip: ['504b0304', '504b0506', '504b0708'],
  docx: ['504b0304'],
  pptx: ['504b0304'],
  xlsx: ['504b0304'],
  rar: ['52617221'],
};

export const verifyFileMagicBytes = (file) => {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const expectedHeaders = MAGIC_NUMBERS[ext];
    
    if (!expectedHeaders) {
      resolve(true);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e || !e.target || !e.target.result) {
        resolve(false);
        return;
      }
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }
      
      const isValid = expectedHeaders.some((hex) => header.startsWith(hex));
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

export const extractFolderId = (urlOrId) => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  
  const matchFolders = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolders && matchFolders[1]) return matchFolders[1];

  const matchUserFolders = trimmed.match(/\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (matchUserFolders && matchUserFolders[1]) return matchUserFolders[1];

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

  return '';
};

export const fetchFolderContents = async (folderId, accessToken) => {
  if (!folderId || !accessToken) return [];

  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent('files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, createdTime, size, owners)');
    const url = `${DRIVE_API_BASE}/files?q=${query}&fields=${fields}&pageSize=1000&includeItemsFromAllDrives=true&supportsAllDrives=true`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch folder contents');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    return [];
  }
};

export const createDriveFolder = async (folderName, parentFolderId, accessToken) => {
  const metadata = {
    name: sanitizeString(folderName),
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

export const uploadFileToDrive = async (file, parentFolderId, accessToken, customName, onProgress) => {
  const metadata = {
    name: sanitizeString(customName || file.name),
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
          const percent = Math.min(100, Math.max(1, Math.round((e.loaded / e.total) * 100)));
          onProgress(percent, e.loaded, e.total);
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

export const deleteDriveItem = async (fileOrFolderId, accessToken) => {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileOrFolderId}?supportsAllDrives=true`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete item from Google Drive');
  }

  return true;
};

export const revokeGoogleToken = async (accessToken) => {
  if (!accessToken) return;
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  } catch (err) {
    console.error('Error revoking token:', err);
  }
};