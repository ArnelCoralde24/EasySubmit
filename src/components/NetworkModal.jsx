import React, { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { WifiOff, RotateCw, X } from 'lucide-react';

export const NetworkModal = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const verifyActualConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.status === 204 || response.ok;
    } catch {
      return false;
    }
  };

  const checkConnectionStatus = async () => {
    setIsChecking(true);
    const status = await Network.getStatus();

    if (!status.connected) {
      setIsOffline(true);
      setIsChecking(false);
      return;
    }

    const hasInternet = await verifyActualConnection();
    setIsOffline(!hasInternet);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnectionStatus();

    const networkListener = Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        setIsOffline(true);
      } else {
        checkConnectionStatus();
      }
    });

    return () => {
      networkListener.then(handler => handler.remove());
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl overflow-hidden border border-cyan-400/30 bg-gradient-to-b from-slate-900/80 via-indigo-950/70 to-slate-950/90 backdrop-blur-xl shadow-cyan-500/10">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={() => setIsOffline(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

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
          onClick={checkConnectionStatus}
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