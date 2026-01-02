import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '@/lib/axios';


// Define types
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role_id: number;
    role?: string; // Add role field
    status: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    _hasHydrated: boolean;

    // Actions
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    verifyToken: () => Promise<boolean>;
    clearError: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await axios.post('/auth/login', {
                        username,
                        password
                    });

                    if (response.data.success && response.data.data) {
                        const { user, token } = response.data.data;

                        if (!user || !token) {
                            throw new Error('Invalid response structure from server');
                        }

                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });

                        // Set default authorization header for future requests
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    } else {
                        throw new Error(response.data.message || 'Login failed');
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage
                    });
                    throw error;
                }
            },

            logout: () => {
                // Clear axios default header
                delete axios.defaults.headers.common['Authorization'];

                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            verifyToken: async () => {
                const { token } = get();

                if (!token) {
                    return false;
                }

                try {
                    const response = await axios.post('/auth/verify', {}, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        // Token is valid, update user data if needed
                        if (response.data.data?.user) {
                            set({ user: response.data.data.user, isAuthenticated: true });
                        }
                        return true;
                    } else {
                        get().logout();
                        return false;
                    }
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            clearError: () => {
                set({ error: null });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);

// Initialize axios interceptor to add token to all requests
useAuthStore.subscribe((state) => {
    if (state.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    }
});

