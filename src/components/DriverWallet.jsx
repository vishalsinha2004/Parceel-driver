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
        
        // Calculate total earnings
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
      <div className="flex flex-col items-center justify-center h-full pb-32">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold tracking-wide">Syncing wallet...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto pb-32 bg-zinc-50 font-sans">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-zinc-900 font-black tracking-tight">💳 Pilot Wallet</h2>
      
      {/* Earnings Gradient Card */}
      <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-8 rounded-3xl text-white shadow-[0_15px_30px_rgba(34,197,94,0.3)] mb-6 text-center relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <p className="text-sm m-0 opacity-90 font-bold uppercase tracking-widest mb-1">Available Balance</p>
          <h1 className="text-6xl m-0 font-black tracking-tighter drop-shadow-md my-2">₹{earnings.toFixed(2)}</h1>
          
          <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-sm">
             <p className="text-sm m-0 font-bold">Based on <span className="text-yellow-300 text-base">{ridesCount}</span> lifetime trips</p>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button 
        onClick={() => alert("Bank withdrawal integration coming soon!")}
        className="w-full p-4 bg-zinc-900 text-white rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black active:scale-95 transition-all tracking-wide flex items-center justify-center gap-2"
      >
        <span>🏦</span> WITHDRAW TO BANK
      </button>

    </div>
  );
}