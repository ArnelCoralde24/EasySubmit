import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

const WEB_CLIENT_ID = "431007270977-j9h45it3o6fclmko97tttuioovqgb9m0.apps.googleusercontent.com";

export const initGoogleAuth = () => {
  if (Capacitor.isNativePlatform()) {
    GoogleAuth.initialize({
      clientId: WEB_CLIENT_ID,
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.appdata'],
      grantOfflineAccess: true,
    });
  }
};

export const signInWithGoogle = async (isReconnect = false) => {
  try {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: WEB_CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.appdata'],
        grantOfflineAccess: true,
      });

      if (isReconnect) {
        try {
          await GoogleAuth.signOut();
        } catch (e) {}
      }

      try {
        const silentUser = await GoogleAuth.refresh();
        const silentToken = silentUser?.authentication?.accessToken || silentUser?.authentication?.idToken;
        if (silentToken) {
          return {
            success: true,
            email: silentUser.email,
            name: silentUser.displayName || silentUser.givenName,
            accessToken: silentToken,
            idToken: silentUser.authentication?.idToken,
            user: silentUser
          };
        }
      } catch (silentErr) {}
    }

    const googleUser = await GoogleAuth.signIn();

    return {
      success: true,
      email: googleUser.email,
      name: googleUser.displayName || googleUser.givenName,
      accessToken: googleUser.authentication?.accessToken,
      idToken: googleUser.authentication?.idToken,
      user: googleUser
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in with Google"
    };
  }
};

export const signOutGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut();
    }
    return { success: true };
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
    return { success: false, error };
  }
};