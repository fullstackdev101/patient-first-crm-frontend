import apiClient from './client';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiError {
    success: false;
    message: string;
}

// Login user
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    console.log('🔐 Login response:', response.data);
    console.log('🔐 Success:', response.data.success);
    console.log('🔐 Token:', response.data.data?.token);

    // Store token and user data
    if (response.data.success) {
        const token = response.data.data.token;
        const user = response.data.data.user;

        console.log('✅ Storing token:', token ? token.substring(0, 20) + '...' : 'NULL');
        console.log('✅ Storing user:', user);

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Verify storage
        console.log('✅ Verification - authToken in localStorage:', !!localStorage.getItem('authToken'));
        console.log('✅ Verification - user in localStorage:', !!localStorage.getItem('user'));
    } else {
        console.log('❌ Login failed - not storing token');
    }

    return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
    try {
        await apiClient.post('/auth/logout');
    } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
};

// Verify token
export const verifyToken = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get('/auth/verify');
        return response.data.success;
    } catch (error) {
        return false;
    }
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
};
