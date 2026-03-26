import axios from 'axios';
import { store } from '@/store'; // Import your Redux store directly
import { logout } from '@/store/slices/appSlice';

const api = axios.create({
  // Fallback to localhost if env variable is missing
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  
  // CRITICAL: This tells Axios to send/receive the HTTP-only cookies
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- GLOBAL RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response
    return response;
  },
  (error) => {
    // If the backend rejects the token (Expired, Invalid, or Logged out)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // 1. Instantly wipe the stale user data from Redux & LocalStorage
      store.dispatch(logout());
      
      // 2. Safely redirect to login (only if we are in the browser and not already on the login page)
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Always reject the promise so the specific component can still catch the error if needed
    return Promise.reject(error);
  }
);

export default api;