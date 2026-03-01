  import React, { useState, useEffect } from 'react';
  import api from './api/axios';
  import Signup from './components/Signup';
  import Login from './components/Login';
  import './App.css';
  import IndoraMap from './components/IndoraMap';
  import io from 'socket.io-client'; // <-- ADDED SOCKET.IO

  function App() {
    // 1. Define State
    const [userState, setUserState] = useState({ 
      isLoggedIn: false, 
      username: '', 
      isVerified: false 
    });
    const [orders, setOrders] = useState([]);
    const [showLogin, setShowLogin] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    
    // --- ADDED SOCKET INITIALIZATION ---
    const [socket, setSocket] = useState(null);

    // --- FIX: Restore Auth Token on Refresh & Init Socket ---
    useEffect(() => {
      const token = localStorage.getItem('access_token');
      const savedUsername = localStorage.getItem('driver_username') || '';
      const savedOnline = localStorage.getItem('indora_driver_online') === 'true';
      
      // Connect socket globally for the app
      const newSocket = io('http://localhost:8000');
      setSocket(newSocket);
      
      if (token) {
        // 1. Put the token back into the API headers so 'Accept Ride' doesn't fail
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUserState({
          isLoggedIn: true,
          username: savedUsername,
          isVerified: true
        });
        setIsOnline(savedOnline);
      }
      
      return () => newSocket.disconnect();
    }, []);
    // ------------------------------------------

    // 2. Derive active ride from state
    const activeRide = orders.find(o => o.status.toLowerCase() === 'accepted');

    // --- API Handlers ---
    const handleLogin = (username, token) => {
      if (!token) {
        console.error("Login failed: No token provided");
        return;
      }
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('driver_username', username); 
      
      // 2. Attach token to API headers upon successful login
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
      
      setUserState({ 
        isLoggedIn: true, 
        username: username, 
        isVerified: true 
      });
    };

    const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('driver_username');      
      localStorage.removeItem('indora_driver_online'); 
      
      // 3. Completely wipe the token from API headers for security
      delete api.defaults.headers.common['Authorization'];
      
      setIsOnline(false);
      setUserState({ 
        isLoggedIn: false, 
        username: '', 
        isVerified: false 
      });
      setOrders([]);
      console.log("Logout successful: Token cleared.");
    };

    const toggleOnline = async () => {
      try {
          const response = await api.post('users/driver_profile/toggle_status/'); 
          setIsOnline(response.data.is_online);
          localStorage.setItem('indora_driver_online', response.data.is_online);
      } catch (error) {
          console.error("Toggle failed:", error.response?.data || error.message);
          const fallbackStatus = !isOnline;
          setIsOnline(fallbackStatus); 
          localStorage.setItem('indora_driver_online', fallbackStatus);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await api.get('rides/');
        const activeOrNew = response.data.filter(o => {
          const s = o.status.toLowerCase();
          return s === 'requested' || s === 'accepted';
        });
        setOrders(activeOrNew);
      } catch (error) { 
        console.error("Fetch error:", error); 
      }
    };

    // --- Effects ---
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
        
        // --- EMIT SOCKET EVENT FOR CUSTOMER APP ---
        if (socket) socket.emit('ride_accepted', { order_id: id });
        
        fetchOrders(); 
      } catch (error) { 
        console.error("Accept Error:", error.response?.data || error.message);
        alert("Error accepting ride. Check console for details."); 
      }
    };

    const completeRide = async (id) => {
    try {
      console.log(`Attempting to complete ride #${id}...`);
      
      // Changed to POST request to match your backend action!
      await api.post(`rides/${id}/complete_ride/`);
      
      // Emit socket event to instantly notify customer
      if (socket) socket.emit('ride_completed', { order_id: id });
      
      alert("🏁 Trip Finished!");
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) { 
      console.error("Error completing ride:", error.response?.data || error.message);
      alert("Error completing ride! Check console."); 
    }
  };

    const moveDriver = async (id) => {
      const fakeLat = 28.61 + (Math.random() * 0.02);
      const fakeLng = 77.20 + (Math.random() * 0.02);
      try {
        await api.patch(`rides/${id}/`, { driver_lat: fakeLat, driver_lng: fakeLng });
        console.log(`✅ Moved Order ${id} to: ${fakeLat} / ${fakeLng}`);
      } catch (error) { 
        console.error("Move failed:", error.response?.data); 
      }
    };

    // --- Render Logic ---
    if (!userState.isLoggedIn) {
      return showLogin ? 
        <Login onLoginSuccess={handleLogin} switchToSignup={() => setShowLogin(false)} /> : 
        <Signup onSignupSuccess={handleLogin} />;
    }

    return (
      <div className="driver-container" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* 1. Dynamic Header with Toggle */}
        <header className="header" style={{ 
            background: isOnline ? '#27ae60' : '#000', 
            color: '#fff', 
            padding: '10px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            zIndex: 2000,
            transition: 'background 0.3s ease'
        }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>🚖 Indora Driver</h2>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={toggleOnline}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', border: 'none', 
                        background: '#fff', color: isOnline ? '#27ae60' : '#000',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                    }}
                >
                    {isOnline ? '🟢 ONLINE' : '⚪ GO ONLINE'}
                </button>

                <button 
                    onClick={handleLogout}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', border: '1px solid white', 
                        background: 'transparent', color: 'white',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                    }}
                >
                    🚪 LOGOUT
                </button>
            </div>
        </header>

        {/* 2. Main Body Content */}
        <div style={{ flex: 1, position: 'relative' }}>
          
          {activeRide ? (
            /* --- NAVIGATION MODE (Full Screen) --- */
            <div className="navigation-mode" style={{ height: '100%', width: '100%' }}>
              {/* Floating Top Card */}
              <div style={{ 
                position: 'absolute', top: '20px', left: '15px', right: '15px', 
                zIndex: 1000, background: 'white', padding: '20px', borderRadius: '15px', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)', border: '1px solid #eee' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#2ecc71' }}>Active Trip: #{activeRide.id}</h3>
                  <span style={{ fontSize: '12px', background: '#f1f2f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>OTP: 4592</span>
                </div>
                
                {/* --- ADDED CUSTOMER INFO TO DRIVER UI --- */}
                <div style={{ margin: '10px 0', padding: '8px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    👤 {activeRide.customer_name || 'Customer'}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#2980b9', fontWeight: 'bold' }}>
                    📞 {activeRide.customer_phone || 'No phone provided'}
                  </p>
                </div>

                <p style={{ margin: '12px 0', fontSize: '15px', fontWeight: '500' }}>
                  🏁 {activeRide.dropoff_address || "Navigating to Destination..."}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                  <button onClick={() => moveDriver(activeRide.id)} style={{ flex: 1, padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📍 MOVE CAR
                  </button>
                  <button onClick={() => completeRide(activeRide.id)} style={{ flex: 1, padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    🏁 FINISH
                  </button>
                </div>
              </div>

              {/* The Map Component */}
              <IndoraMap 
                pickup={activeRide.pickup_lat ? [activeRide.pickup_lat, activeRide.pickup_lng] : null} 
                dropoff={activeRide.dropoff_lat ? [activeRide.dropoff_lat, activeRide.dropoff_lng] : null}
                driverLocation={activeRide.driver_lat ? [activeRide.driver_lat, activeRide.driver_lng] : null}
                routeGeometry={activeRide.route_geometry}
              />
            </div>
          ) : (
            /* --- LIST MODE / OFFLINE VIEW --- */
            <div style={{ padding: '20px', background: '#f9f9f9', height: '100%', overflowY: 'auto' }}>
              {!isOnline ? (
                <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
                  <div style={{ fontSize: '60px' }}>💤</div>
                  <h3>You are currently Offline</h3>
                  <p>Go online to start receiving ride requests.</p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Available Requests</h2>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                      <p>Scanning for nearby rides...</p>
                      <div className="loader"></div>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="order-card" style={{ 
                        border: 'none', 
                        padding: '20px', 
                        borderRadius: '15px', 
                        marginBottom: '15px', 
                        background: 'white', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                          <span style={{ fontWeight: 'bold', color: '#2ecc71', fontSize: '20px' }}>₹{order.price}</span>
                          <span style={{ fontSize: '13px', color: '#999', background: '#f8f9fa', padding: '4px 8px', borderRadius: '5px' }}>
                            {order.distance_km} km
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#444' }}>
                          <p style={{ margin: '5px 0' }}>📍 <b>From:</b> {order.pickup_address}</p>
                          <p style={{ margin: '5px 0' }}>🏁 <b>To:</b> {order.dropoff_address}</p>
                        </div>
                        <button 
                          onClick={() => acceptOrder(order.id)} 
                          style={{ 
                            width: '100%', 
                            marginTop: '15px', 
                            padding: '14px', 
                            background: '#27ae60', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
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
      </div>
    );
  }

  export default App;