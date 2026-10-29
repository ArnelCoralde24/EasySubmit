import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import pkg from '../../package.json';

export const CURRENT_APP_VERSION = pkg.version || "1.0.8";
const GITHUB_OWNER = "ArnelCoralde24";
const GITHUB_REPO = "EasySubmit";

let isDownloadInProgress = false;

export const checkForAppUpdates = async () => {
  const cacheBuster = Date.now();
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest?t=${cacheBuster}`;

  try {
    let responseData = null;

    if (Capacitor.isNativePlatform()) {
      const response = await CapacitorHttp.get({
        url: apiUrl,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'EasySubmitApp/1.0',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.status === 200) {
        responseData = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
      }
    } else {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        responseData = await response.json();
      }
    }

    if (responseData && responseData.tag_name) {
      const rawLatestTag = String(responseData.tag_name).trim(); 
      const cleanLatest = rawLatestTag.replace(/[^0-9.]/g, ''); 
      const cleanCurrent = CURRENT_APP_VERSION.replace(/[^0-9.]/g, ''); 

      const apkAsset = responseData.assets?.find((asset) => 
        asset.name && asset.name.toLowerCase().endsWith('.apk')
      );
      const downloadUrl = apkAsset ? apkAsset.browser_download_url : responseData.html_url;

      const hasUpdateAvailable = compareVersions(cleanCurrent, cleanLatest) < 0;

      if (hasUpdateAvailable) {
        return {
          hasUpdate: true,
          latestVersion: rawLatestTag,
          downloadUrl: downloadUrl,
          releaseNotes: responseData.body || "A new version is available with improved features and bug fixes.",
          message: `🚀 Please Update to New Version`
        };
      }
    }

    return {
      hasUpdate: false,
      error: false,
      message: "✓ You are on the latest version"
    };

  } catch (err) {
    return {
      hasUpdate: false,
      error: true,
      message: "⚠️ Could not connect to update server."
    };
  }
};

const compareVersions = (v1, v2) => {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
};

export const downloadAndInstallApk = async (downloadUrl, onStatusChange) => {
  if (!downloadUrl || isDownloadInProgress) return;

  try {
    isDownloadInProgress = true;
    if (onStatusChange) onStatusChange('downloading');

    if (Capacitor.isNativePlatform()) {
      await AppLauncher.openUrl({ url: downloadUrl });
    } else {
      window.open(downloadUrl, '_blank');
    }

    setTimeout(() => {
      isDownloadInProgress = false;
      if (onStatusChange) onStatusChange('idle');
    }, 3000);

  } catch (error) {
    console.error('Download error:', error);
    isDownloadInProgress = false;
    if (onStatusChange) onStatusChange('error');
  }
};