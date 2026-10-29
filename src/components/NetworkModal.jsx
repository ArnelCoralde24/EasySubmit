import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { WifiOff, RotateCw, X } from 'lucide-react';

export const NetworkModal = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const verifyConnectionProbe = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  };

  const checkConnection = async () => {
    if (!Capacitor.isNativePlatform()) return;

    setIsChecking(true);

    try {
      const status = await Network.getStatus();

      if (!status.connected) {
        setIsOffline(true);
        setIsChecking(false);
        return;
      }

      const hasInternetAccess = await verifyConnectionProbe();
      setIsOffline(!hasInternetAccess);
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    checkConnection();

    let networkListenerHandle;

    Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        setIsOffline(true);
      } else {
        checkConnection();
      }
    }).then(handle => {
      networkListenerHandle = handle;
    });

    const handleOnline = () => checkConnection();
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (networkListenerHandle) networkListenerHandle.remove();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isOffline]);

  if (!Capacitor.isNativePlatform() || !isOffline) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg transition-all duration-300 select-none"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl overflow-hidden border border-cyan-400/30 bg-gradient-to-b from-slate-900/90 via-indigo-950/80 to-slate-950/95 backdrop-blur-xl shadow-cyan-500/10">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mx-auto mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b from-cyan-400/20 to-blue-600/10 border border-cyan-300/30 shadow-inner">
          <div className="relative">
            <WifiOff className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-slate-900 shadow-md">
              <X className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold tracking-wide text-white mb-2">
          No internet connection
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-8 px-2">
          Check your network settings and try again later.
        </p>

        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="w-full py-3.5 px-6 rounded-2xl font-medium text-white text-base flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-cyan-500/25 border border-cyan-300/40 disabled:opacity-60"
        >
          <RotateCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Try Again'}</span>
        </button>

      </div>
    </div>
  );
};