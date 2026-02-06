'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store';
import { useTeamsStore } from '@/store/teamsStore';

export default function TeamsPage() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const { teams, isLoading, fetchTeams } = useTeamsStore();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        team_name: '',
        description: '',
        status: 'active'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Access control: Only Super Admin (1) and QA Manager (6)
    useEffect(() => {
        const userRoleId = currentUser?.role_id;
        if (userRoleId !== 1 && userRoleId !== 6) {
            router.replace('/dashboard');
        }
    }, [currentUser, router]);

    useEffect(() => {
        fetchTeams();
    }, []);

    const resetForm = () => {
        setFormData({
            team_name: '',
            description: '',
            status: 'active'
        });
        setIsAdding(false);
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                // Update existing team
                await axios.put(`/teams/${editingId}`, formData);
                setSuccess('Team updated successfully');
            } else {
                // Create new team
                await axios.post('/teams', formData);
                setSuccess('Team created successfully');
            }

            await fetchTeams();
            resetForm();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save team');
        }
    };

    const handleEdit = (team: any) => {
        setFormData({
            team_name: team.team_name,
            description: team.description || '',
            status: team.status
        });
        setEditingId(team.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            await axios.delete(`/teams/${id}`);
            setSuccess('Team deleted successfully');
            await fetchTeams();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete team');
        }
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        {/* Page Header - Full Width */}
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 className="page-title">Teams Management</h2>
                                <p className="page-subtitle">Manage teams for categorizing agents and tracking sales</p>
                            </div>
                            {!isAdding && (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="btn-primary"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Add New Team
                                </button>
                            )}
                        </div>

                        {/* Success/Error Messages - Full Width */}
                        {success && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#d1fae5',
                                border: '1px solid #a7f3d0',
                                borderRadius: '8px',
                                color: '#065f46',
                                fontSize: '14px',
                                marginBottom: '24px',
                            }}>
                                {success}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '14px',
                                marginBottom: '24px',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Add/Edit Form - Constrained Width */}
                        {isAdding && (
                            <div style={{ maxWidth: '1000px', marginBottom: '24px' }}>
                                <div className="card">
                                    <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-200)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--gray-900)' }}>
                                            {editingId ? 'Edit Team' : 'Add New Team'}
                                        </h3>
                                    </div>
                                    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                                Team Name <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.team_name}
                                                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '8px',
                                                    fontSize: '14px'
                                                }}
                                                placeholder="e.g., Sales Team"
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    resize: 'vertical'
                                                }}
                                                placeholder="Team description..."
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    background: 'white'
                                                }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: 'var(--gray-200)',
                                                    color: 'var(--gray-700)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: '10px 20px',
                                                    background: 'var(--primary-500)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {editingId ? 'Update Team' : 'Create Team'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Teams Table - Full Width */}
                        <div className="card">
                            <div className="table-container">
                                {isLoading ? (
                                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-600)' }}>
                                        <div style={{ marginBottom: '12px' }}>Loading teams...</div>
                                    </div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Team Name</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teams.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-600)' }}>
                                                        No teams found. Click "Add New Team" to create one.
                                                    </td>
                                                </tr>
                                            ) : (
                                                teams.map((team) => (
                                                    <tr key={team.id}>
                                                        <td className="text-bold">{team.team_name}</td>
                                                        <td className="text-muted">{team.description || '-'}</td>
                                                        <td>
                                                            <span className={`badge ${team.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                                                                {team.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleEdit(team)}
                                                                    className="btn-icon"
                                                                    title="Edit"
                                                                    style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '6px',
                                                                        background: 'white',
                                                                        cursor: 'pointer',
                                                                        color: '#6366f1'
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                                                        </path>
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(team.id)}
                                                                    className="btn-icon"
                                                                    title="Delete"
                                                                    style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '6px',
                                                                        background: 'white',
                                                                        cursor: 'pointer',
                                                                        color: '#ef4444'
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                                        </path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
