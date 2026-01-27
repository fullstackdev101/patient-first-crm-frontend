'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useLeadsStore } from '@/store';
import axios from '@/lib/axios';

export default function AgentLeadsPage() {
    const {
        leads,
        isLoading,
        error,
        totalLeads
    } = useLeadsStore();

    // Local state for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // State for statuses from database
    const [statuses, setStatuses] = useState<any[]>([]);

    // Local pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Fetch statuses from API
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get('/statuses');
                if (response.data.success) {
                    setStatuses(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };
        fetchStatuses();
    }, []);

    // Refetch when filters change
    useEffect(() => {
        const fetchWithFilters = async () => {
            useLeadsStore.setState({ isLoading: true, error: null });

            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString()
                });

                if (searchQuery) params.append('search', searchQuery);
                if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

                const response = await axios.get(`/leads?${params}`);

                if (response.data.success) {
                    useLeadsStore.setState({
                        leads: response.data.data.leads,
                        totalLeads: response.data.data.total,
                        isLoading: false
                    });
                }
            } catch (error: any) {
                useLeadsStore.setState({
                    error: error.response?.data?.message || 'Failed to fetch leads',
                    isLoading: false
                });
            }
        };

        fetchWithFilters();
    }, [searchQuery, statusFilter, currentPage]);

    // Calculate pagination
    const totalPages = Math.ceil(totalLeads / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalLeads);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'badge-success';
            case 'Pending':
                return 'badge-warning';
            case 'Manager Review':
            case 'Manage Review':
                return 'badge-info';
            case 'QA Review':
                return 'badge-purple';
            case 'Rejected':
                return 'badge-danger';
            case 'Entry':
                return 'badge-default';
            case 'New':
                return 'badge-info';
            case 'Contacted':
                return 'badge-default';
            case 'Qualified':
                return 'badge-purple';
            case 'Converted':
                return 'badge-success';
            case 'Lost':
                return 'badge-danger';
            default:
                return 'badge-default';
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
                                <h2 className="page-title">My Leads</h2>
                                <p className="page-subtitle">View and manage your assigned leads</p>
                            </div>
                            <Link href="/leads/add" className="btn-primary"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'transform 0.2s' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add New Lead
                            </Link>
                        </div>

                        {/* Filter Card */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-content" style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="search-box">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or ID..."
                                            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '14px' }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        style={{ padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                                        value={statusFilter || 'All'}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        {statuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.status_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Leads Table */}
                        <div className="card">
                            {isLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>Loading leads...</div>
                                </div>
                            ) : error ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--danger-500)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>Error: {error}</div>
                                </div>
                            ) : leads.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>No leads found</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</div>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Patient Name</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map((lead: any) => (
                                                <tr key={lead.id}>
                                                    <td>
                                                        <span className="text-mono">{lead.id}</span>
                                                    </td>
                                                    <td>
                                                        <div className="text-bold">{lead.first_name} {lead.last_name}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(lead.status)}`} style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {lead.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {!isLoading && !error && totalLeads > 0 && (
                                <div style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid var(--gray-200)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                        Showing {startIndex + 1} to {endIndex} of {totalLeads} leads
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '6px',
                                                background: currentPage === 1 ? 'var(--gray-100)' : 'white',
                                                color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Previous
                                        </button>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '6px',
                                                    background: currentPage === page ? 'var(--primary-500)' : 'white',
                                                    color: currentPage === page ? 'white' : 'var(--gray-700)',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: currentPage === page ? '600' : '500',
                                                    minWidth: '40px',
                                                }}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '6px',
                                                background: currentPage === totalPages ? 'var(--gray-100)' : 'white',
                                                color: currentPage === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
