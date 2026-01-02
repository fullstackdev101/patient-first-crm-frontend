'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useUsersStore } from '@/store';

export default function AddUserPage() {
    const router = useRouter();
    const { createUser, isLoading, error, clearError } = useUsersStore();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: 'password123', // Default password as per requirement
        status: 'Active',
        role_id: 3, // Default to Agent
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await createUser(formData);
            alert('User created successfully!');
            router.push('/users');
        } catch (err: any) {
            alert(err.response?.data?.message || error || 'Failed to create user. Please try again.');
        }
    };

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
                                    <h2 className="page-title">Add New User</h2>
                                    <p className="page-subtitle">Create a new team member</p>
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
                                                    required
                                                    placeholder="john.doe"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                                                <label className="form-label">Password *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    required
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
                                                    Default password is "password123"
                                                </p>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Role *</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.role_id}
                                                    onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                                >
                                                    <option value={1}>Admin</option>
                                                    <option value={2}>Manager</option>
                                                    <option value={3}>Agent</option>
                                                    <option value={4}>QA</option>
                                                    <option value={5}>Reviewer</option>
                                                </select>
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
                                        {isLoading ? 'Creating...' : 'Create User'}
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
