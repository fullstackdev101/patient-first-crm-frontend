import { create } from 'zustand';
import axios from '@/lib/axios';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role_id: number;
    status: string;
    assigned_ip?: string;
}

interface UsersState {
    users: User[];
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchUsers: () => Promise<void>;
    fetchUserById: (id: number) => Promise<void>;
    createUser: (user: Partial<User>) => Promise<void>;
    updateUser: (id: number, user: Partial<User>) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.get('/users');

            if (response.data.success) {
                set({
                    users: response.data.data,
                    isLoading: false
                });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch users',
                isLoading: false
            });
        }
    },

    fetchUserById: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.get(`/users/${id}`);

            if (response.data.success) {
                set({
                    currentUser: response.data.data,
                    isLoading: false
                });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch user',
                isLoading: false
            });
        }
    },

    createUser: async (user: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post('/users', user);

            if (response.data.success) {
                await get().fetchUsers();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create user',
                isLoading: false
            });
            throw error;
        }
    },

    updateUser: async (id: number, user: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.put(`/users/${id}`, user);

            if (response.data.success) {
                if (get().currentUser?.id === id) {
                    set({ currentUser: response.data.data });
                }
                await get().fetchUsers();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update user',
                isLoading: false
            });
            throw error;
        }
    },

    deleteUser: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.delete(`/users/${id}`);

            if (response.data.success) {
                await get().fetchUsers();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to delete user',
                isLoading: false
            });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    }
}));
