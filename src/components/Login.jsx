import React, { useState } from 'react';
import api from '../api/axios';

const Login = ({ onLoginSuccess, switchToSignup }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('auth/login/', { 
        username: formData.username, 
        password: formData.password 
      });

      const token = response.data.access; 

      if (token) {
        onLoginSuccess(formData.username, token);
      } else {
        alert("❌ Server did not return a valid token.");
      }
      
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      alert("❌ Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-50 flex items-center justify-center p-4 md:p-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] w-full max-w-md border border-zinc-100">
                
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-zinc-900 italic tracking-tighter drop-shadow-sm">P- Pilot</h2>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Driver Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <input 
            placeholder="Username" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required 
            className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 transition-all font-medium text-zinc-900"
          />
          <input 
            type="password"
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
            className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 transition-all font-medium text-zinc-900"
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-4 rounded-2xl text-white font-black uppercase tracking-wide transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] mt-2 ${
              loading ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 hover:bg-black active:scale-95'
            }`}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-zinc-400 mt-8">
          New Pilot? <span onClick={switchToSignup} className="text-red-600 hover:text-red-700 cursor-pointer transition-colors">Apply here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;