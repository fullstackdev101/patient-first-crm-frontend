import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 3000, // 3 second timeout - faster redirect when backend is unavailable
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        console.log('🔧 Axios Interceptor Running:');
        console.log('   Method:', config.method?.toUpperCase());
        console.log('   URL:', config.url);

        // Get token from auth-storage (same as @/lib/axios)
        const authStorage = localStorage.getItem('auth-storage');
        console.log('   auth-storage exists:', !!authStorage);

        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                const token = state?.token;
                console.log('   Token from auth-storage:', token ? token.substring(0, 20) + '...' : 'NULL');

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('   ✅ Authorization header SET:', config.headers.Authorization.substring(0, 30) + '...');
                } else {
                    console.log('   ❌ No token in auth-storage state');
                }
            } catch (error) {
                console.log('   ❌ Error parsing auth-storage:', error);
            }
        } else {
            console.log('   ❌ No auth-storage in localStorage');
        }

        console.log('   Final headers:', config.headers);
        return config;
    },
    (error) => {
        console.log('❌ Axios interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
