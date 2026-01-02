'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useLeadsStore } from '@/store';
import axios from '@/lib/axios';

// Removed hardcoded LeadStatus type - now fetching from API

export default function LeadsPage() {
    const {
        leads,
        isLoading,
        error,
        fetchLeads,
        setSearchQuery,
        setStatusFilter,
        setCurrentPage,
        searchQuery,
        statusFilter,
        currentPage,
        totalLeads
    } = useLeadsStore();

    // State for statuses from database
    const [statuses, setStatuses] = useState<any[]>([]);

    const itemsPerPage = 5;

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

    // Fetch leads on component mount
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Refetch when filters change
    useEffect(() => {
        fetchLeads();
    }, [searchQuery, statusFilter, currentPage, fetchLeads]);

    // Calculate pagination
    const totalPages = Math.ceil(totalLeads / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalLeads);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'badge-success'; // Green
            case 'Pending':
                return 'badge-warning'; // Yellow/Orange
            case 'Manager Review':
            case 'Manage Review':
                return 'badge-info'; // Blue
            case 'QA Review':
                return 'badge-purple'; // Purple
            case 'Rejected':
                return 'badge-danger'; // Red
            case 'Entry':
                return 'badge-default'; // Gray
            case 'New':
                return 'badge-info'; // Blue (keeping existing)
            case 'Contacted':
                return 'badge-default'; // Gray
            case 'Qualified':
                return 'badge-purple'; // Purple
            case 'Converted':
                return 'badge-success'; // Green
            case 'Lost':
                return 'badge-danger'; // Red
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
                                <h2 className="page-title">Leads Management</h2>
                                <p className="page-subtitle">Manage and track all patient leads</p>
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
                                            <option key={status.id} value={status.status_name}>
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
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters or add a new lead</div>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Patient Name</th>
                                                <th>Contact</th>
                                                <th>Status</th>
                                                <th>Assigned Agent</th>
                                                <th>Date</th>
                                                <th>Actions</th>
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
                                                        <div className="text-sm text-muted">
                                                            DOB: {lead.date_of_birth ? lead.date_of_birth : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>{lead.phone}</div>
                                                        <div className="text-sm text-muted">{lead.email}</div>
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
                                                    <td>
                                                        {lead.assigned_to ? (
                                                            <span style={{ fontWeight: '500', fontSize: '13px', color: '#111827' }}>
                                                                {lead.assigned_to} ({lead.assigned_to_role || 'Agent'})
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-muted">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {/* View Icon */}
                                                            <Link href={`/leads/view/${lead.id}`} className="btn-icon" title="View Lead" style={{ textDecoration: 'none' }}>
                                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                                </svg>
                                                            </Link>
                                                            {/* Edit Icon */}
                                                            <Link href={`/leads/${lead.id}`} className="btn-icon" title="Edit Lead" style={{ textDecoration: 'none' }}>
                                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                                </svg>
                                                            </Link>
                                                        </div>
                                                    </td>
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
