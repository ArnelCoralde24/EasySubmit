import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { verifyBiometricAuth } from '../services/securityService';

export default function BiometricLockScreen({ isOpen, onUnlockSuccess }) {
  const [authState, setAuthState] = useState('idle'); // 'idle' | 'success' | 'failed'

  if (!isOpen) return null;

  const handleTriggerAuth = async () => {
    setAuthState('idle');
    const success = await verifyBiometricAuth();

    if (success) {
      setAuthState('success');
      setTimeout(() => {
        onUnlockSuccess();
      }, 1200);
    } else {
      setAuthState('failed');
      setTimeout(() => {
        setAuthState('idle');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030611] text-white flex flex-col justify-between items-center p-8 select-none overflow-hidden animate-fade-in">
      {/* Background Neon Glowing Waves Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Section: EasySubmit Logo Branding */}
      <div className="relative z-10 pt-8 flex items-center gap-3 animate-slide-down">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.6)]">
          <div className="w-full h-full bg-[#050b1e] rounded-full flex items-center justify-center border border-cyan-400/40">
            <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-blue-400">
              ES
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
            Easy<span className="text-cyan-400">Submit</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.25em] uppercase">
            SUBMIT • ORGANIZE • DRIVE
          </p>
        </div>
      </div>

      {/* Middle Section: Dynamic Status Feedback (ACCESS GRANTED / DENIED) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center min-h-[160px]">
        {authState === 'success' && (
          <div className="p-5 bg-emerald-950/60 border border-emerald-400/50 rounded-3xl shadow-[0_0_50px_rgba(52,211,153,0.4)] backdrop-blur-2xl text-center space-y-2 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-black text-emerald-300 tracking-wider uppercase">
              ACCESS GRANTED
            </h2>
            <p className="text-xs font-semibold text-slate-300">Welcome Back!</p>
          </div>
        )}

        {authState === 'failed' && (
          <div className="p-5 bg-rose-950/60 border border-rose-500/50 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.4)] backdrop-blur-2xl text-center space-y-2 animate-bounce-short">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/60 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <XCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-black text-rose-300 tracking-wider uppercase">
              ACCESS DENIED
            </h2>
            <p className="text-xs font-semibold text-slate-300">Try Again</p>
          </div>
        )}

        {authState === 'idle' && (
          <div className="text-center space-y-2 opacity-80">
            <Shield className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-slate-300 tracking-wide">
              App Locked with Biometric Security
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section: Biometric Trigger Button with Futuristic Scanner Design */}
      <div className="relative z-10 pb-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleTriggerAuth}
          className="relative group p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {/* Outer Glowing Scanner Frame Corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

          {/* Glowing Fingerprint Ring */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 border-2 border-cyan-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.5)] group-hover:scale-105 transition">
            <Fingerprint className="w-11 h-11 text-cyan-300 stroke-[1.8] animate-pulse" />
          </div>
        </button>

        <p className="text-xs font-bold text-cyan-300 tracking-widest uppercase">
          Use Biometric
        </p>
      </div>
    </div>
  );
}