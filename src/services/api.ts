import axios from 'axios';

const api = axios.create({
  // Fallback to localhost if env variable is missing
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  
  // CRITICAL: This tells Axios to send/receive the HTTP-only cookies
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;