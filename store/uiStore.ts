import { create } from 'zustand';

interface UIState {
    // Modal states
    isModalOpen: boolean;
    modalType: string | null;
    modalData: any;

    // Loading states
    globalLoading: boolean;

    // Toast/notification
    toast: {
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    };

    // Sidebar
    isSidebarCollapsed: boolean;

    // Actions
    openModal: (type: string, data?: any) => void;
    closeModal: () => void;
    setGlobalLoading: (loading: boolean) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    hideToast: () => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isModalOpen: false,
    modalType: null,
    modalData: null,

    globalLoading: false,

    toast: {
        show: false,
        message: '',
        type: 'info'
    },

    isSidebarCollapsed: false,

    openModal: (type: string, data?: any) => {
        set({
            isModalOpen: true,
            modalType: type,
            modalData: data
        });
    },

    closeModal: () => {
        set({
            isModalOpen: false,
            modalType: null,
            modalData: null
        });
    },

    setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
    },

    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        set({
            toast: {
                show: true,
                message,
                type
            }
        });

        // Auto-hide after 3 seconds
        setTimeout(() => {
            set((state) => ({
                toast: { ...state.toast, show: false }
            }));
        }, 3000);
    },

    hideToast: () => {
        set((state) => ({
            toast: { ...state.toast, show: false }
        }));
    },

    toggleSidebar: () => {
        set((state) => ({
            isSidebarCollapsed: !state.isSidebarCollapsed
        }));
    }
}));
