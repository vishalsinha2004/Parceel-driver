// src/App.jsx
import React, { useState, useEffect } from 'react';
import api from './api/axios';
import Signup from './components/Signup';
import Login from './components/Login';
import './App.css';
import IndoraMap from './components/IndoraMap';
import DriverReviews from './components/DriverReviews';
import DriverHistory from './components/DriverHistory'; 
import DriverWallet from './components/DriverWallet';   
import io from 'socket.io-client';

function App() {
  const [userState, setUserState] = useState({ isLoggedIn: false, username: '', isVerified: false });
  const [orders, setOrders] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUsername = localStorage.getItem('driver_username') || '';
    const savedOnline = localStorage.getItem('indora_driver_online') === 'true';
    
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserState({ isLoggedIn: true, username: savedUsername, isVerified: true });
      setIsOnline(savedOnline);
    }
    return () => newSocket.disconnect();
  }, []);

  const activeRide = orders.find(o => o.status.toLowerCase() === 'accepted');

  useEffect(() => {
    let watchId;
    if (activeRide && isOnline) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.patch(`rides/${activeRide.id}/`, { driver_lat: latitude, driver_lng: longitude });
            if (socket) socket.emit('driver_location_update', { order_id: activeRide.id, lat: latitude, lng: longitude });
          } catch (error) { console.error("Failed to update location", error); }
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [activeRide, isOnline, socket]);

  const handleLogin = (username, token) => {
    if (!token) return;
    localStorage.setItem('access_token', token);
    localStorage.setItem('driver_username', username); 
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    setUserState({ isLoggedIn: true, username: username, isVerified: true });
  };

  const handleLogout = () => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setIsOnline(false);
    setUserState({ isLoggedIn: false, username: '', isVerified: false });
    setOrders([]);
    setCurrentView('home'); 
  };

  const toggleOnline = async () => {
    try {
        const response = await api.post('users/driver_profile/toggle_status/'); 
        setIsOnline(response.data.is_online);
        localStorage.setItem('indora_driver_online', response.data.is_online);
    } catch (error) {
        const fallbackStatus = !isOnline;
        setIsOnline(fallbackStatus); 
        localStorage.setItem('indora_driver_online', fallbackStatus);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('rides/');
      const activeOrNew = response.data.filter(o => o.status.toLowerCase() === 'requested' || o.status.toLowerCase() === 'accepted');
      setOrders(activeOrNew);
    } catch (error) { console.error("Fetch error:", error); }
  };

  useEffect(() => {
    let interval;
    if (userState.isLoggedIn && isOnline) {
      fetchOrders();
      interval = setInterval(fetchOrders, 3000);
    } else if (!isOnline) {
      setOrders([]); 
    }
    return () => clearInterval(interval);
  }, [userState.isLoggedIn, isOnline]);

  const acceptOrder = async (id) => {
    try {
      await api.post(`rides/${id}/accept_ride/`);
      if (socket) socket.emit('ride_accepted_event', { order_id: id });
      fetchOrders(); 
      setCurrentView('home'); 
    } catch (error) { alert("Error accepting ride."); }
  };

  const completeRide = async (id) => {
    try {
      await api.post(`rides/${id}/complete_ride/`);
      if (socket) socket.emit('ride_completed_event', { order_id: id });
      alert("🏁 Trip Finished!");
      setOrders(prev => prev.filter(o => o.id !== id));
      setCurrentView('wallet'); 
    } catch (error) { alert("Error completing ride."); }
  };

  if (!userState.isLoggedIn) {
    return showLogin ? 
      <Login onLoginSuccess={handleLogin} switchToSignup={() => setShowLogin(false)} /> : 
      <Signup onSignupSuccess={handleLogin} />;
  }

  return (
    /* RESPONSIVE WRAPPER: Limits width on desktop, full width on mobile */
    <div className="h-[100dvh] w-full md:max-w-md mx-auto bg-zinc-50 flex flex-col relative md:border-x md:border-zinc-200 md:shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden font-sans">
      
      {/* 1. Dynamic Header */}
      <header className={`p-4 flex justify-between items-center z-[2000] shadow-md transition-colors duration-500 ${isOnline ? 'bg-green-500' : 'bg-slate-800'}`}>
          <h2 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter m-0 drop-shadow-sm">P- Pilot</h2>
          
          <div className="flex gap-2 md:gap-3 items-center">
              <button 
                  onClick={toggleOnline}
                  className={`flex items-center gap-1.5 px-3 py-2 md:px-4 rounded-full font-black text-[10px] md:text-xs transition-all shadow-sm ${isOnline ? 'bg-white text-green-600 hover:bg-green-50' : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'}`}
              >
                  {isOnline ? (
                      <>
                          {/* Pulsing Solid Dot for Online */}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                              <circle cx="12" cy="12" r="10" />
                          </svg>
                          ONLINE
                      </>
                  ) : (
                      <>
                          {/* Hollow Ring for Offline */}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <circle cx="12" cy="12" r="10" />
                          </svg>
                          OFFLINE
                      </>
                  )}
              </button>

              <button 
                  onClick={handleLogout}
                  title="Logout"
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                  {/* Professional Logout / Exit Icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
              </button>
          </div>
      </header>

      {/* 2. Main Body Content */}
      <div className="flex-1 relative">
        {currentView === 'reviews' ? <DriverReviews /> :
         currentView === 'history' ? <DriverHistory /> :
         currentView === 'wallet'  ? <DriverWallet /> : 
         activeRide ? (
          
          /* --- NAVIGATION MODE --- */
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white p-4 md:p-5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-zinc-100">
              <h3 className="m-0 text-green-500 font-black text-base md:text-lg uppercase tracking-wide flex items-center gap-2">
                <span className="animate-pulse">🟢</span> Active Trip #{activeRide.id}
              </h3>
              
              <div className="my-3 md:my-4 p-3 md:p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <p className="m-0 mb-1 text-sm md:text-base font-bold text-zinc-800">👤 {activeRide.customer_name || 'Customer'}</p>
                <p className="m-0 text-xs md:text-sm text-blue-600 font-bold">📞 {activeRide.customer_phone || 'No phone provided'}</p>
              </div>

              <p className="mb-4 text-sm md:text-base font-semibold text-zinc-600 flex items-start gap-2">
                <span>🏁</span> 
                <span className="leading-snug">{activeRide.dropoff_address || "Navigating to Destination..."}</span>
              </p>
              
              <button onClick={() => completeRide(activeRide.id)} className="w-full p-3 md:p-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-black text-base md:text-lg transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
                FINISH TRIP
              </button>
            </div>

            <IndoraMap 
              pickup={activeRide.pickup_lat ? [activeRide.pickup_lat, activeRide.pickup_lng] : null} 
              dropoff={activeRide.dropoff_lat ? [activeRide.dropoff_lat, activeRide.dropoff_lng] : null}
              driverLocation={activeRide.driver_lat ? [activeRide.driver_lat, activeRide.driver_lng] : null}
              routeGeometry={activeRide.route_geometry}
            />
          </div>
        ) : (
          
          /* --- LIST MODE / OFFLINE VIEW --- */
          <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto pb-32">
            {!isOnline ? (
              <div className="text-center mt-[15vh] md:mt-[20vh] text-zinc-400 px-4">
                <div className="text-6xl mb-4 opacity-50 transition-transform hover:scale-110 cursor-default">💤</div>
                <h3 className="font-black text-xl md:text-2xl text-zinc-500 mb-2">You are Offline</h3>
                <p className="font-medium text-sm md:text-base mb-8">Go online to start receiving ride requests.</p>

                {/* Motivational Quote Card */}
                <div className="mx-auto max-w-sm bg-gradient-to-br from-white to-zinc-50 p-6 rounded-3xl border border-zinc-200 shadow-[0_8px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                   <div className="absolute -top-3 -left-3 text-5xl opacity-10">✈️</div>
                   <p className="relative z-10 text-sm md:text-base font-black text-zinc-700 italic leading-relaxed">
                     "You are the real Pilot on the road. <br/> Take off with happiness, land with so much money!"
                   </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg md:text-xl mb-4 font-black text-zinc-800 tracking-wide">Available Requests</h2>
                {orders.length === 0 ? (
                  <div className="text-center mt-[20vh] text-zinc-400">
                    <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-sm md:text-base text-zinc-500">Scanning your area for riders...</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="p-4 md:p-5 rounded-3xl mb-4 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-zinc-100 transition-transform hover:-translate-y-1">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-green-500 text-2xl md:text-3xl tracking-tight">₹{order.price}</span>
                        <span className="text-xs md:text-sm text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-xl font-bold tracking-wide">
                          {order.distance_km} km
                        </span>
                      </div>
                      
                      <div className="text-xs md:text-sm text-zinc-600 leading-relaxed space-y-2 mb-5 md:mb-6">
                        <div className="flex gap-2 items-start">
                          <span className="mt-0.5">📍</span>
                          <p className="m-0"><span className="font-bold text-zinc-800">Pickup:</span> {order.pickup_address}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className="mt-0.5">🏁</span>
                          <p className="m-0"><span className="font-bold text-zinc-800">Dropoff:</span> {order.dropoff_address}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => acceptOrder(order.id)} 
                        className="w-full p-3 md:p-4 bg-zinc-900 hover:bg-black active:scale-95 text-white rounded-xl font-black text-sm md:text-base transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                      >
                        ACCEPT RIDE
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Navigation Bar */}
      {(!activeRide || currentView !== 'home') && (
        <div className="absolute bottom-0 left-0 right-0 bg-white flex justify-around items-center pb-safe pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-zinc-100 z-[3000]">
          
          {/* HOME ICON */}
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 p-2 md:p-3 flex-1 transition-colors ${currentView === 'home' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-90">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-wider">Home</span>
          </button>
          
          {/* WALLET ICON */}
          <button onClick={() => setCurrentView('wallet')} className={`flex flex-col items-center gap-1 p-2 md:p-3 flex-1 transition-colors ${currentView === 'wallet' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-90">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-wider">Wallet</span>
          </button>
          
          {/* HISTORY ICON */}
          <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center gap-1 p-2 md:p-3 flex-1 transition-colors ${currentView === 'history' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-90">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" x2="8" y1="13" y2="13"/>
              <line x1="16" x2="8" y1="17" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-wider">History</span>
          </button>
          
          {/* REVIEWS ICON (Fills in when active for a premium touch!) */}
          <button onClick={() => setCurrentView('reviews')} className={`flex flex-col items-center gap-1 p-2 md:p-3 flex-1 transition-colors ${currentView === 'reviews' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentView === 'reviews' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-90">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-wider">Reviews</span>
          </button>

        </div>
      )}
    </div>
  );
}

export default App;