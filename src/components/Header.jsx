import React from 'react';
import { Home, Clock, BookOpen, Sliders, ShieldCheck, User, Settings } from 'lucide-react';

export default function Header({
  accessToken,
  user,
  onConnectDrive,
  onSignOut,
  onOpenHistory,
  onOpenHelp,
  onOpenSettings
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between select-none transition-all">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 flex items-center justify-center font-black text-base sm:text-lg text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] border border-white/20">
          ES
        </div>
        <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
          EasySubmit
          <ShieldCheck className="w-4 h-4 text-emerald-400" title="Protected Portal" />
        </span>
      </div>

      <div className="flex md:hidden items-center justify-center">
        <button
          type="button"
          onClick={onOpenSettings}
          className="relative p-2.5 rounded-2xl bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-90 transition-all duration-200"
          title="Open Settings & History"
        >
          <Settings className="w-5 h-5 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
        </button>
      </div>

      <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md">
        <button 
          type="button" 
          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button 
          type="button" 
          onClick={onOpenHistory} 
          className="px-4 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 hover:bg-white/5 transition"
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>History</span>
        </button>

        <button 
          type="button" 
          onClick={onOpenHelp} 
          className="px-4 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 hover:bg-white/5 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>How It Works</span>
        </button>

        <button 
          type="button" 
          onClick={onOpenSettings} 
          className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-white/5 transition"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="flex items-center gap-2">
        {accessToken ? (
          <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-500/30 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[80px] sm:max-w-[120px]">{user?.name || 'Connected'}</span>
            <button type="button" onClick={onSignOut} className="text-[10px] text-red-400 hover:text-red-300 font-bold ml-1">Sign Out</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnectDrive}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Connect Drive</span>
          </button>
        )}
      </div>
    </header>
  );
}