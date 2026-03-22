// src/components/DriverProfile.jsx
import React from 'react';

export default function DriverProfile({ username, onLogout }) {
  return (
    <div className="absolute inset-0 pt-20 p-4 md:p-6 overflow-y-auto pb-32 bg-zinc-50 font-sans">
      
      <h2 className="text-xl md:text-2xl mb-6 text-zinc-900 font-black tracking-tight flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Pilot Profile
      </h2>

      {/* Main Profile Glass Card */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 mb-6 flex flex-col items-center">
        
        {/* Avatar Ring */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-red-400 p-1 mb-4 shadow-lg shadow-red-600/20">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-red-600">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        </div>

        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter capitalize m-0">{username || 'Driver Name'}</h3>
        <p className="text-xs font-bold text-green-600 bg-green-100/80 px-4 py-1.5 rounded-full mt-3 border border-green-200/50 uppercase tracking-widest flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Verified Pilot
        </p>
      </div>

      {/* Account Details Section */}
      <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Account Details</h4>
      
      <div className="space-y-3 mb-8">
        {/* Phone Card */}
        <div className="bg-white/80 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-white/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">Registered Phone</p>
            <p className="text-sm font-bold text-zinc-800 m-0">+91 **********</p>
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="bg-white/80 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-white/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">Assigned Vehicle</p>
            <p className="text-sm font-bold text-zinc-800 m-0">Verification Pending</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full p-4 bg-white/60 backdrop-blur-md text-red-600 rounded-2xl font-black text-base shadow-sm hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all tracking-wide flex items-center justify-center gap-2 border border-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        SECURE LOGOUT
      </button>
      
    </div>
  );
}