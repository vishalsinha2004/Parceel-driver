// src/components/DriverWallet.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DriverWallet() {
  const [earnings, setEarnings] = useState(0);
  const [ridesCount, setRidesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get('rides/');
        const completedRides = response.data.filter(
          ride => ride.status.toLowerCase() === 'completed'
        );
        const total = completedRides.reduce((sum, ride) => sum + parseFloat(ride.price || 0), 0);
        
        setEarnings(total);
        setRidesCount(completedRides.length);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-32 bg-zinc-50">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold tracking-wide">Syncing wallet...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pt-20 p-4 md:p-6 overflow-y-auto pb-24 bg-zinc-50 font-sans">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-zinc-900 font-black tracking-tight flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        Pilot Wallet
      </h2>
      
      {/* Parceel Branded Red/Dark Gradient Card */}
      <div className="bg-gradient-to-br from-red-600 to-zinc-900 p-8 rounded-3xl text-white shadow-[0_15px_30px_rgba(220,38,38,0.25)] mb-6 text-center relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <p className="text-sm m-0 text-red-100 font-bold uppercase tracking-widest mb-1">Available Balance</p>
          <h1 className="text-6xl m-0 font-black tracking-tighter drop-shadow-md my-2">₹{earnings.toFixed(2)}</h1>
          
          <div className="mt-4 inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm">
             <p className="text-sm m-0 font-bold text-white">Based on <span className="text-red-300 text-base">{ridesCount}</span> lifetime trips</p>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button 
        onClick={() => alert("Bank withdrawal integration coming soon!")}
        className="w-full p-4 bg-zinc-900 text-white rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black active:scale-95 transition-all tracking-wide flex items-center justify-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        WITHDRAW TO BANK
      </button>

    </div>
  );
}