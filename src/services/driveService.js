const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

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
  const query = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, createdTime, size)';
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&includeItemsFromAllDrives=true&supportsAllDrives=true`;

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
};

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