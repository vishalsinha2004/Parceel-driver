// src/components/DriverReviews.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DriverReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('rides/');
        const ratedRides = response.data.filter(
          ride => ride.status.toLowerCase() === 'completed' && ride.rating > 0
        );
        ratedRides.sort((a, b) => b.id - a.id);
        setReviews(ratedRides);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-32 bg-zinc-50">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold tracking-wide">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pt-20 p-4 md:p-6 overflow-y-auto pb-24 bg-zinc-50 font-sans">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-zinc-900 font-black tracking-tight flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Rider Feedback
      </h2>
      
      {reviews.length === 0 ? (
        <div className="text-center p-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/50">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-zinc-300"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-lg font-bold text-zinc-400">No reviews yet. Keep driving to get rated!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((ride) => (
            <div key={ride.id} className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-white/60 border-l-4 border-l-yellow-400">
              
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-zinc-400 text-xs uppercase tracking-wider">Trip #{ride.id}</span>
                <span className="text-yellow-400 text-lg tracking-[0.2em] drop-shadow-sm">
                  {'★'.repeat(ride.rating)}{'☆'.repeat(5 - ride.rating)}
                </span>
              </div>
              
              <p className="text-base text-zinc-800 font-bold italic my-3 leading-snug">
                "{ride.feedback || "Great trip, highly recommended!"}"
              </p>
              
              <div className="text-xs font-medium text-zinc-400 mt-4 border-t border-zinc-100 pt-3 space-y-1">
                <p className="m-0 truncate"><b className="text-zinc-500">From:</b> {ride.pickup_address}</p>
                <p className="m-0 truncate"><b className="text-zinc-500">To:</b> {ride.dropoff_address}</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}