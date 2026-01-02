'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useUsersStore } from '@/store';

export default function UsersPage() {
    const { users, isLoading, error, fetchUsers, deleteUser } = useUsersStore();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            setDeletingId(id);
            try {
                await deleteUser(id);
            } catch (err) {
                alert('Failed to delete user. Please try again.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const getStatusBadgeClass = (status: string) => {
        const trimmedStatus = status?.trim();
        return trimmedStatus === 'Active' || trimmedStatus === 'A' ? 'badge-success' : 'badge-default';
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleName = (roleId: number) => {
        const roles: { [key: number]: string } = {
            1: 'Admin',
            2: 'Manager',
            3: 'Agent',
            4: 'QA',
            5: 'Reviewer'
        };
        return roles[roleId] || 'Unknown';
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className="page-title">Users Management</h2>
                                <p className="page-subtitle">Manage system users and their roles</p>
                            </div>
                            <Link href="/users/add" className="btn-primary"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'transform 0.2s' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add New User
                            </Link>
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

                        {/* Users Table */}
                        <div className="card">
                            <div className="table-container">
                                {isLoading ? (
                                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-600)' }}>
                                        <div style={{ marginBottom: '12px' }}>Loading users...</div>
                                    </div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Assigned IP</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-600)' }}>
                                                        No users found
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div className="user-avatar">{getUserInitials(user.name)}</div>
                                                                <div className="text-bold">{user.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="text-muted">{user.email}</td>
                                                        <td>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                background: '#f3f4f6',
                                                                borderRadius: '6px',
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#374151'
                                                            }}>
                                                                {getRoleName(user.role_id || 1)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {user.assigned_ip ? (
                                                                <span style={{
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: '#0891b2',
                                                                    padding: '4px 8px',
                                                                    background: '#ecfeff',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #a5f3fc'
                                                                }}>
                                                                    {user.assigned_ip}
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    fontSize: '13px',
                                                                    color: '#9ca3af',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    Not assigned
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                                                                {user.status?.trim()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <Link
                                                                    href={`/users/assign-ip/${user.id}`}
                                                                    className="btn-icon"
                                                                    title="Assign IP"
                                                                    style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '6px',
                                                                        background: 'white',
                                                                        cursor: 'pointer',
                                                                        color: '#0891b2',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                                                        </path>
                                                                    </svg>
                                                                </Link>
                                                                <Link
                                                                    href={`/users/edit/${user.id}`}
                                                                    className="btn-icon"
                                                                    title="Edit"
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                                                        </path>
                                                                    </svg>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(user.id, user.name)}
                                                                    className="btn-icon"
                                                                    title="Delete"
                                                                    disabled={deletingId === user.id}
                                                                    style={{ opacity: deletingId === user.id ? 0.5 : 1 }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor"
                                                                        viewBox="0 0 24 24" style={{ color: 'var(--rose-500)' }}>
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
