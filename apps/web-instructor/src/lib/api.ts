import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (cookie-based for now)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('Resource not found');
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
