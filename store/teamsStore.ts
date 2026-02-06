import { create } from 'zustand';
import axios from '@/lib/axios';

export interface Team {
    id: number;
    team_name: string;
    description?: string;
    status: string;
    sort_order: number;
}

interface TeamsState {
    teams: Team[];
    isLoading: boolean;

    // Actions
    fetchTeams: () => Promise<void>;
}

export const useTeamsStore = create<TeamsState>((set) => ({
    teams: [],
    isLoading: false,

    // Fetch all active teams (for dropdowns)
    fetchTeams: async () => {
        set({ isLoading: true });

        try {
            const response = await axios.get('/teams', {
                params: { status: 'active', limit: 100 } // Get all active teams
            });

            if (response.data.success) {
                set({
                    teams: response.data.data.teams || [],
                    isLoading: false
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch teams:', error);
            set({ isLoading: false });
        }
    }
}));

