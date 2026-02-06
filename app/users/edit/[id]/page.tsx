'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import Topbar from '../../../components/Topbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useUsersStore } from '@/store';
import { useTeamsStore } from '@/store/teamsStore';
import axios from '@/lib/axios';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = parseInt(params.id as string);

    const { currentUser, isLoading, error, fetchUserById, updateUser, clearError } = useUsersStore();
    const { teams, fetchTeams } = useTeamsStore();

    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '', // Optional - only update if provided
        status: 'Active',
        role_id: 3,
        team_id: undefined as number | undefined,
    });

    // Fetch roles and teams on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/roles');
                if (response.data.success) {
                    setRoles(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
        fetchTeams();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserById(userId);
        }
    }, [userId, fetchUserById]);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                password: '',
                status: currentUser.status?.trim() || 'Active',
                role_id: currentUser.role_id || 3,
                team_id: currentUser.team_id || undefined,
            });
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            // Only include password if it's been changed
            const updateData = formData.password
                ? formData
                : { ...formData, password: undefined };

            await updateUser(userId, updateData);
            alert('User updated successfully!');
            router.push('/users');
        } catch (err: any) {
            alert(err.response?.data?.message || error || 'Failed to update user. Please try again.');
        }
    };

    if (isLoading && !currentUser) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <Topbar />
                    <main className="content">
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-600)' }}>
                            Loading user data...
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div style={{ maxWidth: '1000px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Link href="/users" className="btn-icon" style={{ width: '40px', height: '40px' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                </Link>
                                <div>
                                    <h2 className="page-title">Edit User</h2>
                                    <p className="page-subtitle">Update user information</p>
                                </div>
                            </div>

                            {/* Error Message */}
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

                            <form onSubmit={handleSubmit}>
                                {/* User Information */}
                                <div className="card" style={{ marginBottom: '24px' }}>
                                    <div className="card-header">
                                        <h3 className="card-title">User Information</h3>
                                    </div>
                                    <div className="card-content">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Full Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Username *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    required
                                                    disabled
                                                    style={{
                                                        backgroundColor: 'var(--gray-100)',
                                                        cursor: 'not-allowed',
                                                        opacity: 0.6
                                                    }}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    required
                                                    placeholder="user@patientfirst.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Password</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Leave blank to keep current password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
                                                    Leave blank to keep current password
                                                </p>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Role *</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.role_id}
                                                    onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                                >
                                                    {roles.map((role) => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Team</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.team_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                >
                                                    <option value="">No Team</option>
                                                    {teams.map((team) => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.team_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
                                                    Optional: Assign user to a team for categorization
                                                </p>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Status *</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <Link href="/users" className="btn-secondary">
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={isLoading}
                                        style={{ opacity: isLoading ? 0.7 : 1 }}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
