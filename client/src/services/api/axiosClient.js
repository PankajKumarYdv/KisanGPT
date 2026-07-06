import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://kisangpt-m6qz.onrender.com/api';

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Clear auth data and force page reload/redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if we are not on public auth pages
        const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];
        const currentPath = window.location.pathname;
        if (!publicPages.includes(currentPath)) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
