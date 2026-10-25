import React from 'react';
import { Sun, Moon, HelpCircle, LogIn, LogOut, CheckCircle2, ShieldCheck, Download, CloudUpload } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, user, onSignIn, onSignOut, onOpenHelp }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">EasySubmit</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-900/60 text-blue-400 border border-blue-500/30 rounded-md">
              DRIVE
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {user ? (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              <div className="w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-[10px]">G</div>
              <span>Connect Drive</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}