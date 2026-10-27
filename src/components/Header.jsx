import React from 'react';
import { Home, Clock, BookOpen, Sliders, ShieldCheck, User, HardDrive } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-lg text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]">
          ES
        </div>
        <span className="font-black text-xl tracking-tight text-white flex items-center gap-2">
          EasySubmit
          <ShieldCheck className="w-4 h-4 text-emerald-400" title="Protected by Maximum Security Protocol" />
        </span>
      </div>

      {/* Center Navigation Pill Group (DITO ITINAMA ANG BUTTONS) */}
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

      {/* Right User Status / Connect */}
      <div className="flex items-center gap-3">
        {accessToken ? (
          <div className="flex items-center gap-2.5 bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-2xl">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="text-xs font-semibold truncate max-w-[100px] sm:max-w-none">{user?.name || 'Connected'}</span>
            <button type="button" onClick={onSignOut} className="text-[10px] text-red-400 hover:underline font-bold ml-1">Sign Out</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnectDrive}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Connect Drive</span>
          </button>
        )}
      </div>
    </header>
  );
}