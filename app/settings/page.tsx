'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '@/store';
import axios from '@/lib/axios';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password validation function
    const validatePassword = (password: string): { valid: boolean; message: string } => {
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }

        // Check for at least 1 special character
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (!specialCharRegex.test(password)) {
            return { valid: false, message: 'Password must contain at least 1 special character' };
        }

        // Check for at least 1 number OR 1 letter
        const hasNumber = /\d/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);
        if (!hasNumber && !hasLetter) {
            return { valid: false, message: 'Password must contain at least 1 number or letter' };
        }

        return { valid: true, message: '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        // Validate password strength
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.put('/users/change-password', {
                newPassword
            });

            if (response.data.success) {
                setSuccess('Password changed successfully!');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header" style={{ marginBottom: '24px' }}>
                            <h2 className="page-title">Settings</h2>
                            <p className="page-subtitle">Manage your account settings and preferences</p>
                        </div>

                        <div className="card" style={{ maxWidth: '600px' }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    Change Password
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px' }}>
                                    Update your password to keep your account secure
                                </p>

                                {/* Success Message */}
                                {success && (
                                    <div style={{
                                        padding: '12px 16px',
                                        background: '#d1fae5',
                                        border: '1px solid #6ee7b7',
                                        borderRadius: '8px',
                                        color: '#065f46',
                                        fontSize: '14px',
                                        marginBottom: '20px',
                                    }}>
                                        {success}
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div style={{
                                        padding: '12px 16px',
                                        background: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        color: '#dc2626',
                                        fontSize: '14px',
                                        marginBottom: '20px',
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* New Password */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: 'var(--gray-700)'
                                        }}>
                                            New Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter your new password"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                            Minimum 6 characters, 1 special character, at least 1 number or letter
                                        </p>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: 'var(--gray-700)'
                                        }}>
                                            Confirm New Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                padding: '10px 24px',
                                                background: isLoading ? 'var(--gray-400)' : 'var(--primary-500)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: isLoading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/')}
                                            style={{
                                                padding: '10px 24px',
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
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* User Information Card */}
                        <div className="card" style={{ maxWidth: '600px', marginTop: '24px' }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                                    Account Information
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Name:</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '8px' }}>
                                            {user?.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Email:</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '8px' }}>
                                            {user?.email}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Username:</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '8px' }}>
                                            {user?.username}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Role:</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '8px' }}>
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
