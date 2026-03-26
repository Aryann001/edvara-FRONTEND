import axios from 'axios';
import { store } from '@/store'; // Import your Redux store directly
import { logout } from '@/store/slices/appSlice';

const api = axios.create({
  // Automatically handles local vs production proxy routing
  baseURL: '/api/v1',
  
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
      
      // 2. Safely redirect to login, BUT ignore background auth checks to prevent redirect loops
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      const isAuthPage = typeof window !== 'undefined' && 
        (window.location.pathname === '/login' || 
         window.location.pathname === '/register' || 
         window.location.pathname === '/forgot-password');
      
      if (!isAuthCheck && !isAuthPage && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Always reject the promise so the specific component can still catch the error if needed
    return Promise.reject(error);
  }
);

export default api;