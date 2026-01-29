'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '@/store';

interface IPAccess {
    id: number;
    ip_address: string;
    location: string;
    details: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function IPAccessPage() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const [ipRecords, setIPRecords] = useState<IPAccess[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<IPAccess | null>(null);

    // Access control: Redirect Agent and License Agent users
    useEffect(() => {
        const userRoleId = currentUser?.role_id;
        if (userRoleId === 3 || userRoleId === 4) {
            router.replace('/dashboard');
        }
    }, [currentUser, router]);

    const [formData, setFormData] = useState({
        ip_address: '',
        location: '',
        details: '',
        status: 'active'
    });

    const [errors, setErrors] = useState({
        ip_address: ''
    });

    // Fetch IP records
    const fetchIPRecords = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/ip-access');
            if (response.data.success) {
                setIPRecords(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching IP records:', error);
            alert('Failed to fetch IP records');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIPRecords();
    }, []);

    // Validate IP address
    const validateIP = (ip: string): boolean => {
        // IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        // IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
            setErrors({ ip_address: 'Invalid IP address format' });
            return false;
        }

        // For IPv4, validate range (0-255)
        if (ipv4Regex.test(ip)) {
            const octets = ip.split('.');
            const invalidOctet = octets.some(octet => parseInt(octet) > 255);
            if (invalidOctet) {
                setErrors({ ip_address: 'Invalid IPv4 address: octets must be 0-255' });
                return false;
            }
        }

        setErrors({ ip_address: '' });
        return true;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateIP(formData.ip_address)) {
            return;
        }

        try {
            if (editingRecord) {
                // Update existing record
                const response = await axios.put(
                    `/ip-access/${editingRecord.id}`,
                    formData
                );
                if (response.data.success) {
                    alert('IP record updated successfully!');
                    setShowAddModal(false);
                    setEditingRecord(null);
                    resetForm();
                    fetchIPRecords();
                }
            } else {
                // Create new record
                const response = await axios.post('/ip-access', formData);
                if (response.data.success) {
                    alert('IP record added successfully!');
                    setShowAddModal(false);
                    resetForm();
                    fetchIPRecords();
                }
            }
        } catch (error: any) {
            console.error('Error saving IP record:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to save IP record');
            }
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this IP record?')) {
            return;
        }

        try {
            const response = await axios.delete(`/ip-access/${id}`);
            if (response.data.success) {
                alert('IP record deleted successfully!');
                fetchIPRecords();
            }
        } catch (error) {
            console.error('Error deleting IP record:', error);
            alert('Failed to delete IP record');
        }
    };

    // Handle edit
    const handleEdit = (record: IPAccess) => {
        setEditingRecord(record);
        setFormData({
            ip_address: record.ip_address,
            location: record.location || '',
            details: record.details || '',
            status: record.status
        });
        setShowAddModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            ip_address: '',
            location: '',
            details: '',
            status: 'active'
        });
        setErrors({ ip_address: '' });
        setEditingRecord(null);
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
                                <h2 className="page-title">IP Access Control</h2>
                                <p className="page-subtitle">Manage IP addresses allowed to access the system</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add IP Address
                            </button>
                        </div>

                        {/* IP Records Table */}
                        <div className="card">
                            {isLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>Loading IP records...</div>
                                </div>
                            ) : ipRecords.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>No IP records found</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>Add your first IP address to get started</div>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>IP Address</th>
                                                <th>Location</th>
                                                <th>Details</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ipRecords.map((record) => (
                                                <tr key={record.id}>
                                                    <td>
                                                        <span className="text-mono" style={{ fontWeight: '600', color: 'var(--primary-600)' }}>
                                                            {record.ip_address}
                                                        </span>
                                                    </td>
                                                    <td>{record.location || '-'}</td>
                                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {record.details || '-'}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${record.status === 'active' ? 'badge-success' : 'badge-default'}`}
                                                            style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">
                                                        {new Date(record.created_at).toLocaleDateString('en-US', {
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="btn-icon"
                                                                title="Edit"
                                                                style={{
                                                                    padding: '8px',
                                                                    border: '1px solid var(--gray-300)',
                                                                    borderRadius: '6px',
                                                                    background: 'white',
                                                                    cursor: 'pointer',
                                                                    color: 'var(--gray-600)'
                                                                }}
                                                            >
                                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                                                    </path>
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(record.id)}
                                                                className="btn-icon"
                                                                title="Delete"
                                                                style={{
                                                                    padding: '8px',
                                                                    border: '1px solid var(--danger-300)',
                                                                    borderRadius: '6px',
                                                                    background: 'white',
                                                                    cursor: 'pointer',
                                                                    color: 'var(--danger-600)'
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Modal */}
                        {showAddModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '20px'
                            }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    width: '100%',
                                    maxWidth: '600px',
                                    maxHeight: '90vh',
                                    overflow: 'auto',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                }}>
                                    {/* Modal Header */}
                                    <div style={{
                                        padding: '24px 32px',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: '#111827'
                                        }}>
                                            {editingRecord ? 'Edit IP Address' : 'Add IP Address'}
                                        </h3>
                                    </div>

                                    {/* Modal Body */}
                                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                                        {/* IP Address Field */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                IP Address <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.ip_address}
                                                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                                                placeholder="e.g., 192.168.1.1"
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    border: errors.ip_address ? '1px solid #ef4444' : '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    fontFamily: 'monospace'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                onBlur={(e) => e.target.style.borderColor = errors.ip_address ? '#ef4444' : '#d1d5db'}
                                            />
                                            {errors.ip_address && (
                                                <div style={{
                                                    color: '#ef4444',
                                                    fontSize: '13px',
                                                    marginTop: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.ip_address}
                                                </div>
                                            )}
                                        </div>

                                        {/* Location Field */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., Office - New York"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                            />
                                        </div>

                                        {/* Details Field */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Details
                                            </label>
                                            <textarea
                                                value={formData.details}
                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                placeholder="Additional details about this IP address"
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    resize: 'vertical',
                                                    fontFamily: 'inherit',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                            />
                                        </div>

                                        {/* Status Field */}
                                        <div style={{ marginBottom: '32px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>

                                        {/* Modal Footer */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            justifyContent: 'flex-end',
                                            paddingTop: '8px'
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddModal(false);
                                                    resetForm();
                                                }}
                                                style={{
                                                    padding: '10px 24px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    background: 'white',
                                                    color: '#374151',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#f9fafb';
                                                    e.currentTarget.style.borderColor = '#9ca3af';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: '10px 24px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    background: '#06b6d4',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#0891b2';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#06b6d4';
                                                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                                }}
                                            >
                                                {editingRecord ? 'Update' : 'Add'} IP Address
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
