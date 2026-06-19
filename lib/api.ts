import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests if it exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('pms_current_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (e) {
          console.error('Failed to parse current user session token', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
