import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Eye, Database, Globe } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('privacy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_0_60px_rgba(37,99,235,0.3)] relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Legal & Privacy Center</h2>
              <p className="text-[11px] text-slate-400">Google Drive API & User Protection Policy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-start gap-3">
                <Eye className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  EasySubmit complies with Google API Services User Data Policy, including Limited Use requirements. Your files and personal details are handled strictly for submission purposes.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  1. Information We Access & Collect
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                  We request access to your Google Account basic profile info (Name and Email) and Google Drive file permissions (<code className="text-cyan-300 font-mono">drive.file</code> and <code className="text-cyan-300 font-mono">drive.readonly</code>). We use this data strictly to verify folder access and upload your school assignments directly to your designated Drive folder.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  2. File Handling & Zero Server Storage
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                  EasySubmit does <strong className="text-slate-200">NOT</strong> store, transmit, or retain your submitted files or Google tokens on any remote servers. All file processing occurs client-side in your web browser and streams directly to Google Drive via secure OAuth 2.0 HTTPS protocols.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  3. Data Sharing & Third-Party Protections
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                  We do not sell, trade, rent, or share your personal data or Google Drive files with any third parties or advertising networks. OAuth access tokens are temporarily stored in your browser session (<code className="text-cyan-300 font-mono">sessionStorage</code>) and are instantly deleted when you click "Sign Out".
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-white">1. Acceptance of Terms</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  By connecting your Google Drive account and using EasySubmit, you agree to comply with these terms. EasySubmit is an educational tool designed for direct homework and project submissions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">2. Acceptable Use Policy</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Users are strictly prohibited from submitting malicious files, viruses, executable scripts, or illicit material through this portal. Automatic security scans check file signatures to reject corrupted or dangerous file types.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">3. Disclaimer of Liability</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  EasySubmit functions as an interface between your device and Google Drive API. We are not responsible for lost files due to invalid teacher folder links, insufficient Google Account storage space, or revoked Drive permissions.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}