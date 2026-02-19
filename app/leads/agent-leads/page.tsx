'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
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
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Reset to page 1 when filters or items-per-page change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

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
    }, [searchQuery, statusFilter, currentPage, itemsPerPage]);

    // Calculate pagination
    const totalPages = Math.ceil(totalLeads / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalLeads);

    // Get badge class based on status ID (not name) for consistency
    // Status IDs: 1=New, 2=Manager Review, 3=QA Review, 4=Approved, 5=Pending, 7=Rejected, 8=License Agent
    const getStatusBadgeClass = (statusId: number | string | undefined) => {
        const id = typeof statusId === 'string' ? parseInt(statusId) : statusId;

        switch (id) {
            case 1: // New
                return 'badge-info'; // Blue
            case 2: // Manager Review
                return 'badge-info'; // Blue
            case 3: // QA Review
                return 'badge-purple'; // Purple
            case 4: // Approved
                return 'badge-success'; // Green
            case 5: // Pending
                return 'badge-warning'; // Yellow/Orange
            case 7: // Rejected
                return 'badge-danger'; // Red
            case 8: // License Agent
                return 'badge-info'; // Blue
            default:
                return 'badge-default'; // Gray
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
                                            placeholder="Search by Patient name, email, phone, or ID..."
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
                                                        <span className={`badge ${getStatusBadgeClass(lead.status_id)}`} style={{
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                            Showing {startIndex + 1} to {endIndex} of {totalLeads} leads
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: '500' }}>
                                                Per page:
                                            </label>
                                            <select
                                                value={itemsPerPage}
                                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                                <option value={250}>250</option>
                                                <option value={500}>500</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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

                                        {/* Smart Page Numbers */}
                                        {(() => {
                                            const pageButtons = [];
                                            const maxVisiblePages = 7;

                                            if (totalPages <= maxVisiblePages) {
                                                for (let i = 1; i <= totalPages; i++) {
                                                    pageButtons.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                border: '1px solid var(--gray-300)',
                                                                borderRadius: '6px',
                                                                background: currentPage === i ? 'var(--primary-500)' : 'white',
                                                                color: currentPage === i ? 'white' : 'var(--gray-700)',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                fontWeight: currentPage === i ? '600' : '500',
                                                                minWidth: '40px',
                                                            }}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }
                                            } else {
                                                // Always show first page
                                                pageButtons.push(
                                                    <button
                                                        key={1}
                                                        onClick={() => handlePageChange(1)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid var(--gray-300)',
                                                            borderRadius: '6px',
                                                            background: currentPage === 1 ? 'var(--primary-500)' : 'white',
                                                            color: currentPage === 1 ? 'white' : 'var(--gray-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: currentPage === 1 ? '600' : '500',
                                                            minWidth: '40px',
                                                        }}
                                                    >
                                                        1
                                                    </button>
                                                );

                                                if (currentPage > 3) {
                                                    pageButtons.push(
                                                        <span key="ellipsis-start" style={{ padding: '8px 4px', color: 'var(--gray-500)' }}>...</span>
                                                    );
                                                }

                                                const startPage = Math.max(2, currentPage - 1);
                                                const endPage = Math.min(totalPages - 1, currentPage + 1);

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pageButtons.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                border: '1px solid var(--gray-300)',
                                                                borderRadius: '6px',
                                                                background: currentPage === i ? 'var(--primary-500)' : 'white',
                                                                color: currentPage === i ? 'white' : 'var(--gray-700)',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                fontWeight: currentPage === i ? '600' : '500',
                                                                minWidth: '40px',
                                                            }}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }

                                                if (currentPage < totalPages - 2) {
                                                    pageButtons.push(
                                                        <span key="ellipsis-end" style={{ padding: '8px 4px', color: 'var(--gray-500)' }}>...</span>
                                                    );
                                                }

                                                // Always show last page
                                                pageButtons.push(
                                                    <button
                                                        key={totalPages}
                                                        onClick={() => handlePageChange(totalPages)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid var(--gray-300)',
                                                            borderRadius: '6px',
                                                            background: currentPage === totalPages ? 'var(--primary-500)' : 'white',
                                                            color: currentPage === totalPages ? 'white' : 'var(--gray-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: currentPage === totalPages ? '600' : '500',
                                                            minWidth: '40px',
                                                        }}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                );
                                            }

                                            return pageButtons;
                                        })()}

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
