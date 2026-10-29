import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';

export const checkDeviceIntegrity = async () => {
  const isEmulator = window.navigator.userAgent.includes('Android') && 
                     (window.location.hostname === 'localhost' || window.navigator.hardwareConcurrency <= 2);
  return { isRooted: false, isEmulator };
};

export const setSecureToken = async (key, value) => {
  await Preferences.set({ key, value });
};

export const getSecureToken = async (key) => {
  const { value } = await Preferences.get({ key });
  return value;
};

export const clearSecureToken = async (key) => {
  await Preferences.remove({ key });
};

export const verifyBiometricAuth = async () => {
  try {
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return false;

    await NativeBiometric.verifyIdentity({
      reason: "Authenticate to access EasySubmit",
      title: "Biometric Security Lock",
      subtitle: "Confirm your identity",
      description: "Scan fingerprint or face to proceed",
    });
    return true;
  } catch (err) {
    return false;
  }
};