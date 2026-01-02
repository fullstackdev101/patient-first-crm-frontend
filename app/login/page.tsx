'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import './login.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, error: authError, isLoading: authLoading, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false,
    });
    const [localError, setLocalError] = useState('');
    const [errorType, setErrorType] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setErrorType('');
        clearError();

        try {
            await login(formData.username, formData.password);
            // Small delay to ensure state is persisted to localStorage
            await new Promise(resolve => setTimeout(resolve, 100));
            // If login is successful, redirect to dashboard
            router.push('/');
        } catch (err: any) {
            // Get error details from response
            const errorMessage = err.response?.data?.message || authError || 'Login failed. Please try again.';
            const errType = err.response?.data?.errorType || '';

            setLocalError(errorMessage);
            setErrorType(errType);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Panel */}
                <div className="login-left">
                    {/* Logo */}
                    <div className="login-logo">
                        <div className="logo-icon">PF</div>
                        <span className="logo-text">PatientFirst</span>
                    </div>

                    <h1>Welcome to PatientFirst CRM</h1>
                    <p className="login-description">
                        Streamline your healthcare lead management with our comprehensive CRM solution.
                    </p>

                    {/* Features */}
                    <div className="login-features">
                        {[
                            'Manage patient leads efficiently',
                            'Track workflow and status updates',
                            'Role-based access control',
                            'Real-time analytics and reporting',
                        ].map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="feature-icon">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="login-right">
                    <div className="login-form-header">
                        <h2>Sign In</h2>
                        <p>Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="john.smith"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '38px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-500)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="form-options">
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                />
                                <span>Remember me</span>
                            </label>
                        </div>

                        {/* Error Message */}
                        {(localError || authError) && (
                            <div style={{
                                padding: '12px 16px',
                                background: errorType === 'IP_RESTRICTED' ? '#fef3c7' : '#fee2e2',
                                border: errorType === 'IP_RESTRICTED' ? '1px solid #fcd34d' : '1px solid #fecaca',
                                borderRadius: '8px',
                                color: errorType === 'IP_RESTRICTED' ? '#92400e' : '#dc2626',
                                fontSize: '14px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <svg
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    style={{ flexShrink: 0, marginTop: '2px' }}
                                >
                                    {errorType === 'IP_RESTRICTED' ? (
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    ) : (
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    )}
                                </svg>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                        {errorType === 'IP_RESTRICTED' ? 'IP Access Restricted' :
                                            errorType === 'INVALID_CREDENTIALS' ? 'Invalid Credentials' :
                                                errorType === 'ACCOUNT_INACTIVE' ? 'Account Inactive' : 'Login Failed'}
                                    </div>
                                    <div>{localError || authError}</div>
                                    {errorType === 'IP_RESTRICTED' && (
                                        <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.9 }}>
                                            Please contact your administrator to update your authorized IP address.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={authLoading}
                            style={{
                                opacity: authLoading ? 0.7 : 1,
                                cursor: authLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {authLoading ? 'Signing In...' : 'Sign In'}
                        </button>

                        {/* Forgot Password */}
                        <div className="forgot-password">
                            <a href="#">Forgot your password?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
