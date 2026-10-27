import React, { useState, useRef, useEffect } from 'react';
import { Home, Clock, BookOpen, Sliders, ShieldCheck, User, Settings, ChevronDown, LogOut } from 'lucide-react';

export default function Header({
  accessToken,
  user,
  onConnectDrive,
  onSignOut,
  onOpenHistory,
  onOpenHelp,
  onOpenSettings
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between select-none transition-all">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 flex items-center justify-center font-black text-base sm:text-lg text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] border border-white/20">
          ES
        </div>
        <span className="font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-1">
          EasySubmit
          <ShieldCheck className="w-4 h-4 text-emerald-400" title="Protected Portal" />
        </span>
      </div>

      <div className="flex md:hidden items-center justify-center">
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md active:scale-95 transition"
          title="Open Settings & History"
        >
          <Settings className="w-4 h-4" />
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

      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {accessToken ? (
          <>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-blue-500/30 px-2.5 py-1.5 rounded-2xl backdrop-blur-md shadow-md active:scale-95 transition"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[65px] sm:max-w-[120px]">
                {user?.name || 'Connected'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-slate-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Connected Account'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </>
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