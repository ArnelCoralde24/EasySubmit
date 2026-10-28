import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '1.0.0'; 
const GITHUB_REPO = 'ArnelCoralde24/EasySubmit';

export const isAndroidNative = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const checkForUpdates = async () => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch release info');
    }

    const data = await response.json();
    const latestVersion = data.tag_name.replace('v', '').trim();

    const apkAsset = data.assets.find(asset => asset.name.endsWith('.apk'));
    const downloadUrl = apkAsset ? apkAsset.browser_download_url : data.html_url;

    const hasUpdate = isNewerVersion(CURRENT_APP_VERSION, latestVersion);

    return {
      hasUpdate,
      latestVersion,
      currentVersion: CURRENT_APP_VERSION,
      downloadUrl,
      releaseNotes: data.body || 'New improvements and bug fixes.'
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      currentVersion: CURRENT_APP_VERSION,
      message: 'Unable to check for updates right now.'
    };
  }
};

const isNewerVersion = (current, latest) => {
  const cParts = current.split('.').map(Number);
  const lParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(cParts.length, lParts.length); i++) {
    const c = cParts[i] || 0;
    const l = lParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};