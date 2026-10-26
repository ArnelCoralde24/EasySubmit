import React from 'react';
import { Sun, Moon, HelpCircle, LogOut } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, user, onSignIn, onSignOut, onOpenHelp }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#070a12]/80 border-b border-slate-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-blue-500/30 flex-shrink-0">
            ES
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white truncate">
              EasySubmit
            </span>
            <span className="hidden xs:inline-block px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] rounded-md border border-blue-500/20">
              DRIVE
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
            title="How it works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                {user.name || 'User'}
              </span>
              <button
                onClick={onSignOut}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 font-black text-[10px] flex items-center justify-center">
                G
              </span>
              <span>Connect Drive</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}