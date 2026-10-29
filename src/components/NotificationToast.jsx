import React, { useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9990] w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300 select-none pointer-events-none">
      <div 
        className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
          isSuccess 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-500/20' 
            : 'bg-red-950/80 border-red-500/40 text-red-200 shadow-red-500/20'
        }`}
      >
        <div className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isSuccess ? <Check className="w-5 h-5 stroke-[2.5]" /> : <AlertTriangle className="w-5 h-5 stroke-[2.5]" />}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold text-sm text-white">{isSuccess ? 'Success!' : 'Warning!'}</h4>
          <p className="text-xs text-slate-200 mt-0.5 leading-snug">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};