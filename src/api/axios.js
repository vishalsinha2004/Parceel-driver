// src/api/axios.js
import axios from 'axios';

const api = axios.create({
    // REPLACE THIS with your actual Render URL if it is different!
    // Make sure it ends with /api/
    baseURL: 'https://parceel-backend.onrender.com/api/', 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    // Ensure the token is valid before attaching
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;