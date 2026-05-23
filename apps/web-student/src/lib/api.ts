import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
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

      if (status === 401) {
        console.error('Unauthorized access');
      }

      if (status === 403) {
        console.error('Access forbidden');
      }

      if (status === 404) {
        console.error('Resource not found');
      }

      if (status >= 500) {
        console.error('Server error');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
