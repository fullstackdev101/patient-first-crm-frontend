'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Sidebar from '../../../components/Sidebar';
import Topbar from '../../../components/Topbar';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface User {
    id: number;
    name: string;
    email: string;
    assigned_ip?: string;
}

interface IPAccess {
    id: number;
    ip_address: string;
    location: string;
    status: string;
}

export default function AssignIPPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id;

    const [user, setUser] = useState<User | null>(null);
    const [ipAddresses, setIPAddresses] = useState<IPAccess[]>([]);
    const [selectedIP, setSelectedIP] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch user details
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/users/${userId}`);
                if (response.data.success) {
                    setUser(response.data.data);
                    setSelectedIP(response.data.data.assigned_ip || '');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                alert('Failed to fetch user details');
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    // Fetch available IP addresses
    useEffect(() => {
        const fetchIPs = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/ip-access');
                if (response.data.success) {
                    // Filter only active IPs
                    const activeIPs = response.data.data.filter((ip: IPAccess) => ip.status === 'active');
                    setIPAddresses(activeIPs);
                }
            } catch (error) {
                console.error('Error fetching IP addresses:', error);
                alert('Failed to fetch IP addresses');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIPs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedIP) {
            alert('Please select an IP address');
            return;
        }

        try {
            setIsSaving(true);
            const response = await axios.put(`/users/${userId}`, {
                assigned_ip: selectedIP
            });

            if (response.data.success) {
                alert('IP assigned successfully!');
                router.push('/users');
            }
        } catch (error: any) {
            console.error('Error assigning IP:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to assign IP');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveIP = async () => {
        if (!confirm('Are you sure you want to remove the assigned IP?')) {
            return;
        }

        try {
            setIsSaving(true);
            const response = await axios.put(`/users/${userId}`, {
                assigned_ip: null
            });

            if (response.data.success) {
                alert('IP removed successfully!');
                setSelectedIP('');
                if (user) {
                    setUser({ ...user, assigned_ip: undefined });
                }
            }
        } catch (error) {
            console.error('Error removing IP:', error);
            alert('Failed to remove IP');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header">
                            <h2 className="page-title">Assign IP Address</h2>
                            <p className="page-subtitle">Assign an IP address to user: {user?.name}</p>
                        </div>

                        <div className="card" style={{ maxWidth: '800px' }}>
                            <div style={{ padding: '32px' }}>
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                        Loading...
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {/* User Info */}
                                        <div style={{
                                            marginBottom: '32px',
                                            padding: '20px',
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                                User Information
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Name</div>
                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{user?.name}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{user?.email}</div>
                                                </div>
                                            </div>
                                            {user?.assigned_ip && (
                                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Currently Assigned IP</div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#0891b2',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        {user.assigned_ip}
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveIP}
                                                            disabled={isSaving}
                                                            style={{
                                                                padding: '4px 12px',
                                                                fontSize: '12px',
                                                                border: '1px solid #fca5a5',
                                                                borderRadius: '4px',
                                                                background: 'white',
                                                                color: '#dc2626',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* IP Selection */}
                                        <div style={{ marginBottom: '32px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Select IP Address <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <select
                                                value={selectedIP}
                                                onChange={(e) => setSelectedIP(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    fontFamily: 'monospace'
                                                }}
                                            >
                                                <option value="">-- Select an IP Address --</option>
                                                {ipAddresses.map((ip) => (
                                                    <option key={ip.id} value={ip.ip_address}>
                                                        {ip.ip_address} {ip.location ? `(${ip.location})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {ipAddresses.length === 0 && (
                                                <div style={{
                                                    marginTop: '8px',
                                                    padding: '12px',
                                                    background: '#fef3c7',
                                                    border: '1px solid #fcd34d',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    color: '#92400e'
                                                }}>
                                                    No active IP addresses available. Please add IP addresses first.
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/users')}
                                                style={{
                                                    padding: '10px 24px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    background: 'white',
                                                    color: '#374151',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving || !selectedIP}
                                                style={{
                                                    padding: '10px 24px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    background: isSaving || !selectedIP ? '#9ca3af' : '#06b6d4',
                                                    color: 'white',
                                                    cursor: isSaving || !selectedIP ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {isSaving ? 'Assigning...' : 'Assign IP Address'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
