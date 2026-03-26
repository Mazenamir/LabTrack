import axios from 'axios';

const api = axios.create({
  // Use your backend URL here
  baseURL: 'http://localhost:3000/api', 
});

// This helps send the token automatically once you have it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;