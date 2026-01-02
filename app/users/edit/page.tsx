'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { getUserById, type UserRole } from '@/lib/mockData';

function EditUserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const user = userId ? getUserById(userId) : null;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: '',
        email: user?.email || '',
        password: '',
        status: 'Active' as 'Active' | 'Inactive',
        role: user?.role || 'Sales' as UserRole,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                username: user.name.toLowerCase().replace(/\s+/g, '.'), // Generate username from name
                email: user.email,
                password: '',
                status: 'Active',
                role: user.role,
            });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <Topbar />
                    <main className="content">
                        <div className="card">
                            <div className="card-content">
                                <h3>User not found</h3>
                                <Link href="/users" className="btn-primary">Back to Users</Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Updated User Data:', {
            id: userId,
            ...formData,
            updatedAt: new Date().toISOString(),
        });

        alert('User updated successfully! (Data logged to console)');
        router.push('/users');
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <Topbar />

                <main className="content">
                    <div className="page-header">
                        <h2 className="page-title">Edit User: {user.name}</h2>
                        <p className="page-subtitle">User ID: {userId}</p>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">User Information</h3>
                        </div>
                        <div className="card-content">
                            <form onSubmit={handleSubmit}>
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
                                            placeholder="username"
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
                                            placeholder="user@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Leave blank to keep current password"
                                            minLength={8}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <small style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>
                                            Only fill this if you want to change the password
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Role *</label>
                                        <select
                                            className="form-select"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Sales">Sales</option>
                                            <option value="QA">QA</option>
                                            <option value="Reviewer">Reviewer</option>
                                            <option value="Agent">Agent</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status *</label>
                                        <select
                                            className="form-select"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <Link href="/users" className="btn-secondary">
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function EditUserPage() {
    return (
        <Suspense fallback={
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <Topbar />
                    <main className="content">
                        <div className="card">
                            <div className="card-content">
                                <h3>Loading...</h3>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        }>
            <EditUserContent />
        </Suspense>
    );
}
