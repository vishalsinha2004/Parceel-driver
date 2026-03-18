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
        // Filter only completed rides
        const completedRides = response.data.filter(
          ride => ride.status.toLowerCase() === 'completed'
        );
        // Sort newest first
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
      <div className="flex flex-col items-center justify-center h-full pb-32">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold tracking-wide">Loading your trip history...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto pb-32 bg-zinc-50 font-sans">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-zinc-900 font-black tracking-tight">📜 Takeoff History</h2>
      
      {history.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-zinc-100">
          <div className="text-5xl mb-3 opacity-30">🛣️</div>
          <p className="text-lg font-bold text-zinc-400">No completed trips yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((ride) => (
            <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-zinc-100 border-l-4 border-l-green-500 transition-transform hover:-translate-y-1">
              
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
                <span className="font-black text-zinc-500 text-sm uppercase tracking-wider">Order #{ride.id}</span>
                <span className="text-green-500 text-2xl font-black tracking-tighter">
                  ₹{ride.price}
                </span>
              </div>
              
              <div className="text-sm font-medium text-zinc-600 space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="mt-0.5 text-zinc-400">📍</span>
                  <p className="m-0 leading-snug">{ride.pickup_address}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="mt-0.5 text-zinc-400">🏁</span>
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