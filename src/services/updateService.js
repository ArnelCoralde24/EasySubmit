import { Capacitor, CapacitorHttp } from '@capacitor/core';

export const CURRENT_APP_VERSION = "1.0.0";
const GITHUB_OWNER = "ArnelCoralde24";
const GITHUB_REPO = "EasySubmit";

export const checkForAppUpdates = async () => {
  const cacheBuster = new Date().getTime();
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
        responseData = response.data;
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
      const rawLatest = String(responseData.tag_name).trim();
      const latestTag = rawLatest.replace(/^v/i, '').trim();
      const currentVersion = CURRENT_APP_VERSION.replace(/^v/i, '').trim();

      const apkAsset = responseData.assets?.find((asset) => asset.name.endsWith('.apk'));
      const downloadUrl = apkAsset ? apkAsset.browser_download_url : responseData.html_url;

      const hasNewVersion = isVersionNewer(currentVersion, latestTag);

      if (hasNewVersion) {
        return {
          hasUpdate: true,
          latestVersion: rawLatest,
          downloadUrl: downloadUrl,
          releaseNotes: responseData.body || "May bagong update na available para sa EasySubmit Mobile!",
          message: `🚀 New Version Available: ${rawLatest}`
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

const isVersionNewer = (currentStr, latestStr) => {
  const parseVersion = (str) => {
    return str
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map((num) => parseInt(num, 10) || 0);
  };

  const currentParts = parseVersion(currentStr);
  const latestParts = parseVersion(latestStr);
  const maxLength = Math.max(currentParts.length, latestParts.length);

  for (let i = 0; i < maxLength; i++) {
    const curr = currentParts[i] || 0;
    const late = latestParts[i] || 0;

    if (late > curr) return true;
    if (late < curr) return false;
  }

  return false;
};

export const downloadAndInstallApk = (downloadUrl) => {
  if (downloadUrl) {
    window.open(downloadUrl, '_system');
  }
};