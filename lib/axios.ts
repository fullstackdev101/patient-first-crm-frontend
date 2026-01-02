import axios from 'axios';

// API URL configuration:
// - Local development: uses http://localhost:3001/api (default fallback)
// - Production: uses NEXT_PUBLIC_API_URL from .env.production or environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Error parsing auth storage:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.response.status === 401) {
                // Clear auth state only - let component-level auth checks handle redirect
                // This prevents potential redirect loops
                localStorage.removeItem('auth-storage');
                console.warn('401 Unauthorized - auth cleared, components will handle redirect');
            }

            // Handle 403 Forbidden
            if (error.response.status === 403) {
                console.error('Access forbidden:', error.response.data.message);
            }

            // Handle 500 Internal Server Error
            if (error.response.status === 500) {
                console.error('Server error:', error.response.data.message);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
