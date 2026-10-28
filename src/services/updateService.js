export const CURRENT_APP_VERSION = "1.0.1";
const GITHUB_OWNER = "ArnelCoralde24";
const GITHUB_REPO = "EasySubmit";

export const checkForAppUpdates = async () => {
  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const latestTag = data.tag_name ? data.tag_name.replace(/^v/, '').trim() : '1.0.0';
      const currentVersion = CURRENT_APP_VERSION.replace(/^v/, '').trim();

      const apkAsset = data.assets?.find((asset) => asset.name.endsWith('.apk'));
      const downloadUrl = apkAsset ? apkAsset.browser_download_url : data.html_url;

      const hasNewVersion = isVersionNewer(currentVersion, latestTag);

      if (hasNewVersion) {
        return {
          hasUpdate: true,
          latestVersion: data.tag_name,
          downloadUrl: downloadUrl,
          releaseNotes: data.body || "May bagong update na available!",
          message: `🚀 New Version Available: ${data.tag_name}`
        };
      }

      return {
        hasUpdate: false,
        error: false,
        message: "✓ You are on the latest version"
      };
    }

    return {
      hasUpdate: false,
      error: false,
      message: "✓ You are on the latest version"
    };

  } catch (err) {
    return {
      hasUpdate: false,
      error: false,
      message: "✓ You are on the latest version"
    };
  }
};

const isVersionNewer = (current, latest) => {
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

export const downloadAndInstallApk = (downloadUrl) => {
  if (downloadUrl) {
    window.open(downloadUrl, '_system');
  }
};