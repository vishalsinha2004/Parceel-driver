// src/components/DriverHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DriverHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('rides/');
        const completedRides = response.data.filter(
          ride => ride.status.toLowerCase() === 'completed'
        );
        completedRides.sort((a, b) => b.id - a.id);
        setHistory(completedRides);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-32 bg-zinc-50">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold tracking-wide">Loading your trip history...</p>
      </div>
    );
  }

  // Common SVGs for UI
  const PickupIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600 mt-0.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
  const DropoffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-600 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

  return (
    <div className="absolute inset-0 pt-20 p-4 md:p-6 overflow-y-auto pb-24 bg-zinc-50 font-sans">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-zinc-900 font-black tracking-tight flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Trip History
      </h2>
      
      {history.length === 0 ? (
        <div className="text-center p-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/50">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-zinc-300"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p className="text-lg font-bold text-zinc-400">No completed trips yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((ride) => (
            <div key={ride.id} className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-white/60 border-l-4 border-l-green-500 transition-transform hover:-translate-y-1">
              
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
                <span className="font-black text-zinc-400 text-xs uppercase tracking-wider">Order #{ride.id}</span>
                <span className="text-green-500 text-2xl font-black tracking-tighter">
                  ₹{ride.price}
                </span>
              </div>
              
              <div className="text-sm font-medium text-zinc-600 space-y-3">
                <div className="flex gap-2 items-start">
                  <PickupIcon />
                  <p className="m-0 leading-snug">{ride.pickup_address}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <DropoffIcon />
                  <p className="m-0 leading-snug">{ride.dropoff_address}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}