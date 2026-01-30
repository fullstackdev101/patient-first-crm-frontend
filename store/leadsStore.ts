import { create } from 'zustand';
import axios from '@/lib/axios';

// Define types based on existing mockData
interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    middle_initial?: string;
    date_of_birth: string;
    phone: string;
    email: string;
    address: string;
    state_of_birth: string;
    ssn: string;
    status: number;
    assigned_agent?: string;
    assigned_to?: number;
    assigned_user_name?: string; // Username of assigned user
    created_at: string;
    height?: string;
    weight?: string;
    insurance_provider?: string;
    policy_number?: string;
    doctor_name?: string;
    doctor_phone?: string;
    doctor_address?: string;
    beneficiary_details?: string;
    plan_details?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
    account_type?: string;
    medical_notes?: string;
    banking_comments?: string;
    // Draft Fields
    initial_draft?: string;
    future_draft?: string;
    // Health Questionnaire
    hospitalized_nursing_oxygen_cancer_assistance?: boolean;
    organ_transplant_terminal_condition?: boolean;
    aids_hiv_immune_deficiency?: boolean;
    diabetes_complications_insulin?: boolean;
    kidney_disease_multiple_cancers?: boolean;
    pending_tests_surgery_hospitalization?: boolean;
    angina_stroke_lupus_copd_hepatitis?: boolean;
    heart_attack_aneurysm_surgery?: boolean;
    cancer_treatment_2years?: boolean;
    substance_abuse_treatment?: boolean;
    cardiovascular_events_3years?: boolean;
    cancer_respiratory_liver_3years?: boolean;
    neurological_conditions_3years?: boolean;
    health_comments?: string;
    covid_question?: boolean;
    assigned_to_role?: string;
}

interface LeadsState {
    leads: Lead[];
    currentLead: Lead | null;
    isLoading: boolean;
    error: string | null;

    // Pagination
    currentPage: number;
    itemsPerPage: number;
    totalLeads: number;

    // Filters
    searchQuery: string;
    statusFilter: string;

    // Actions
    fetchLeads: () => Promise<void>;
    fetchLeadById: (id: string) => Promise<void>;
    createLead: (lead: Partial<Lead>) => Promise<void>;
    updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;

    // Filter actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setCurrentPage: (page: number) => void;
    clearError: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
    leads: [],
    currentLead: null,
    isLoading: false,
    error: null,

    currentPage: 1,
    itemsPerPage: 5,
    totalLeads: 0,

    searchQuery: '',
    statusFilter: 'All',

    fetchLeads: async () => {
        set({ isLoading: true, error: null });

        try {
            const { searchQuery, statusFilter, currentPage, itemsPerPage } = get();

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });

            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

            const response = await axios.get(`/leads?${params}`);

            if (response.data.success) {
                // Backend now returns assigned_to_role directly, no mapping needed
                set({
                    leads: response.data.data.leads,
                    totalLeads: response.data.data.total,
                    isLoading: false
                });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch leads',
                isLoading: false
            });
        }
    },

    fetchLeadById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.get(`/leads/${id}`);

            if (response.data.success) {
                set({
                    currentLead: response.data.data,
                    isLoading: false
                });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch lead',
                isLoading: false
            });
        }
    },

    createLead: async (lead: Partial<Lead>) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`/leads`, lead);

            if (response.data.success) {
                // Refresh leads list
                await get().fetchLeads();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create lead',
                isLoading: false
            });
            throw error;
        }
    },

    updateLead: async (id: string, lead: Partial<Lead>) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.put(`/leads/${id}`, lead);

            if (response.data.success) {
                // Update current lead if it's the one being edited
                if (get().currentLead?.id === id) {
                    set({ currentLead: response.data.data });
                }
                // Refresh leads list
                await get().fetchLeads();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update lead',
                isLoading: false
            });
            throw error;
        }
    },

    deleteLead: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.delete(`/leads/${id}`);

            if (response.data.success) {
                // Refresh leads list
                await get().fetchLeads();
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to delete lead',
                isLoading: false
            });
            throw error;
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
    },

    setStatusFilter: (status: string) => {
        set({ statusFilter: status, currentPage: 1 });
    },

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
    },

    clearError: () => {
        set({ error: null });
    }
}));
