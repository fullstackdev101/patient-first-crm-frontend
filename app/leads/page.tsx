'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import NewLeadNotification from '../components/NewLeadNotification';
import { useLeadsStore } from '@/store';
import { useAuthStore } from '@/store';
import { useTeamsStore } from '@/store/teamsStore';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

// Removed hardcoded LeadStatus type - now fetching from API

export default function LeadsPage() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const {
        leads,
        isLoading,
        error,
        totalLeads
    } = useLeadsStore();

    // Access control: Redirect only Agent users to /leads-agent
    useEffect(() => {
        const userRoleId = currentUser?.role_id;
        if (userRoleId === 3) {
            router.replace('/leads-agent');
        }
    }, [currentUser, router]);

    // Local state for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // State for statuses from database
    const [statuses, setStatuses] = useState<any[]>([]);
    const [licenseAgentStatusId, setLicenseAgentStatusId] = useState<string | null>(null);

    // State for assigned users filter
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
    const [assignedUserFilter, setAssignedUserFilter] = useState('');

    // State for teams filter
    const { teams, fetchTeams } = useTeamsStore();
    const [teamFilter, setTeamFilter] = useState('');

    // State for date filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Local pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, assignedUserFilter, teamFilter, startDate, endDate]);

    // Fetch statuses from API
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get('/statuses');
                if (response.data.success) {
                    // Filter to only show statuses with IDs 5, 6, or 7
                    const filteredStatuses = response.data.data.filter(
                        (status: any) => [5, 6, 7].includes(status.id)
                    );
                    setStatuses(filteredStatuses);
                    // Find License Agent status ID
                    const licenseAgentStatus = response.data.data.find(
                        (status: any) => status.status_name === 'License Agent'
                    );
                    if (licenseAgentStatus) {
                        setLicenseAgentStatusId(licenseAgentStatus.id.toString());
                    }
                }
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };
        fetchStatuses();
    }, []);

    // Fetch all users from API
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await axios.get('/users/all');
                if (response.data.success) {
                    setAssignedUsers(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchAllUsers();
    }, []);

    // Fetch teams from API
    useEffect(() => {
        fetchTeams();
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

                console.log('📄 Fetching page:', currentPage);

                if (searchQuery) params.append('search', searchQuery);
                if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
                if (assignedUserFilter && assignedUserFilter !== 'All') params.append('created_by', assignedUserFilter);
                if (teamFilter && teamFilter !== 'All') params.append('team_id', teamFilter);
                if (startDate) {
                    params.append('start_date', startDate);
                    console.log('📅 Frontend sending start_date:', startDate);
                }
                if (endDate) {
                    params.append('end_date', endDate);
                    console.log('📅 Frontend sending end_date:', endDate);
                }

                console.log('🔍 Current filter values:', {
                    searchQuery,
                    statusFilter,
                    assignedUserFilter,
                    teamFilter,
                    startDate,
                    endDate,
                    currentPage
                });

                console.log('🔍 API Request URL:', `/leads?${params.toString()}`);

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
    }, [searchQuery, statusFilter, assignedUserFilter, teamFilter, startDate, endDate, currentPage, itemsPerPage]);

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

    // Excel Export Function
    const handleExportToExcel = async () => {
        try {
            // Build query params with current filters but no pagination
            const params = new URLSearchParams();

            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
            if (assignedUserFilter && assignedUserFilter !== 'All') params.append('created_by', assignedUserFilter);
            if (teamFilter && teamFilter !== 'All') params.append('team_id', teamFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            // Fetch all leads without pagination limit
            params.append('page', '1');
            params.append('limit', '10000'); // Large limit to get all leads

            const response = await axios.get(`/leads?${params}`);

            if (response.data.success) {
                const leadsData = response.data.data.leads;

                // Format data for Excel - Include ALL columns
                const excelData = leadsData.map((lead: any) => ({
                    // Basic Information
                    'ID': lead.id,
                    'Created By': lead.created_by_name || 'Unknown',
                    'Team': lead.team_name || 'No Team',
                    'Created Date': lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A',
                    'Updated Date': lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A',
                    'Status': lead.status,
                    'Assigned Agent': lead.assigned_to ? `${lead.assigned_to} (${lead.assigned_to_role || 'Agent'})` : 'Unassigned',

                    // Personal Information
                    'First Name': lead.first_name,
                    'Middle Initial': lead.middle_initial || '',
                    'Last Name': lead.last_name,
                    'Date of Birth': lead.date_of_birth || 'N/A',
                    'Phone': lead.phone,
                    'Email': lead.email,
                    'Address': lead.address || 'N/A',
                    'State of Birth': lead.state_of_birth || 'N/A',
                    'SSN': lead.ssn || 'N/A',

                    // Medical Information
                    'Height': lead.height || 'N/A',
                    'Weight': lead.weight || 'N/A',
                    'Insurance Provider': lead.insurance_provider || 'N/A',
                    'Policy Number': lead.policy_number || 'N/A',
                    'Medical Notes': lead.medical_notes || 'N/A',

                    // Doctor Information
                    'Doctor Name': lead.doctor_name || 'N/A',
                    'Doctor Phone': lead.doctor_phone || 'N/A',
                    'Doctor Address': lead.doctor_address || 'N/A',

                    // Beneficiary & Plan Information
                    'Beneficiary Details': lead.beneficiary_details || 'N/A',
                    'Plan Details': lead.plan_details || 'N/A',
                    'Quote Type': lead.quote_type || 'N/A',

                    // Health Questionnaire (Yes/No format)
                    'Hospitalized/Nursing/Oxygen/Cancer Assistance': lead.hospitalized_nursing_oxygen_cancer_assistance ? 'Yes' : 'No',
                    'Organ Transplant/Terminal Condition': lead.organ_transplant_terminal_condition ? 'Yes' : 'No',
                    'AIDS/HIV/Immune Deficiency': lead.aids_hiv_immune_deficiency ? 'Yes' : 'No',
                    'Diabetes Complications/Insulin': lead.diabetes_complications_insulin ? 'Yes' : 'No',
                    'Kidney Disease/Multiple Cancers': lead.kidney_disease_multiple_cancers ? 'Yes' : 'No',
                    'Pending Tests/Surgery/Hospitalization': lead.pending_tests_surgery_hospitalization ? 'Yes' : 'No',
                    'Angina/Stroke/Lupus/COPD/Hepatitis': lead.angina_stroke_lupus_copd_hepatitis ? 'Yes' : 'No',
                    'Heart Attack/Aneurysm/Surgery': lead.heart_attack_aneurysm_surgery ? 'Yes' : 'No',
                    'Cancer Treatment (2 years)': lead.cancer_treatment_2years ? 'Yes' : 'No',
                    'Substance Abuse Treatment': lead.substance_abuse_treatment ? 'Yes' : 'No',
                    'Cardiovascular Events (3 years)': lead.cardiovascular_events_3years ? 'Yes' : 'No',
                    'Cancer/Respiratory/Liver (3 years)': lead.cancer_respiratory_liver_3years ? 'Yes' : 'No',
                    'Neurological Conditions (3 years)': lead.neurological_conditions_3years ? 'Yes' : 'No',
                    'COVID Question': lead.covid_question ? 'Yes' : 'No',
                    'Health Comments': lead.health_comments || 'N/A',

                    // Banking Information
                    'Bank Name': lead.bank_name || 'N/A',
                    'Account Name': lead.account_name || 'N/A',
                    'Account Number': lead.account_number || 'N/A',
                    'Routing Number': lead.routing_number || 'N/A',
                    'Account Type': lead.account_type || 'N/A',
                    'Banking Comments': lead.banking_comments || 'N/A',

                    // Draft Fields
                    'Initial Draft': lead.initial_draft || 'N/A',
                    'Future Draft': lead.future_draft || 'N/A'
                }));

                // Create workbook and worksheet
                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const filename = `leads_export_${timestamp}.xlsx`;

                // Download file
                XLSX.writeFile(workbook, filename);
            }
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export leads to Excel. Please try again.');
        }
    };

    // Delete Lead Function (Super Admin only)
    const handleDeleteLead = async (leadId: number, leadName: string) => {
        // Confirmation alert
        const confirmed = window.confirm(
            `Are you sure you want to delete the lead for "${leadName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return; // User cancelled
        }

        try {
            const response = await axios.delete(`/leads/${leadId}`);

            if (response.data.success) {
                alert('Lead deleted successfully!');
                // Refresh the leads list
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString()
                });

                if (searchQuery) params.append('search', searchQuery);
                if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
                if (assignedUserFilter && assignedUserFilter !== 'All') params.append('assigned_to', assignedUserFilter);
                if (teamFilter && teamFilter !== 'All') params.append('team_id', teamFilter);
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);

                const refreshResponse = await axios.get(`/leads?${params}`);

                if (refreshResponse.data.success) {
                    useLeadsStore.setState({
                        leads: refreshResponse.data.data.leads,
                        totalLeads: refreshResponse.data.data.total,
                        isLoading: false
                    });
                }
            }
        } catch (error: any) {
            console.error('Error deleting lead:', error);
            alert(`Failed to delete lead: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    return (
        <ProtectedRoute>
            <NewLeadNotification />
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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {/* Export to Excel button - Super Admin only */}
                                {currentUser?.role_id === 1 && (
                                    <button
                                        onClick={handleExportToExcel}
                                        style={{
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px 24px',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Export to Excel
                                    </button>
                                )}
                                <Link href="/leads/add" className="btn-primary"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'transform 0.2s' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Add New Lead
                                </Link>
                            </div>
                        </div>

                        {/* Filter Card */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-content" style={{ padding: '16px 24px' }}>
                                {/* First Row: Search, Status, Assigned User, Team */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="search-box">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, phone, or ID..."
                                            style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '14px' }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        style={{
                                            padding: '10px 12px',
                                            border: '1px solid var(--gray-300)',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white'
                                        }}
                                        value={statusFilter || 'All'}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">Select Status</option>
                                        {statuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.status_name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        style={{ padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                                        value={assignedUserFilter || 'All'}
                                        onChange={(e) => setAssignedUserFilter(e.target.value)}
                                    >
                                        <option value="All">All Users</option>
                                        {assignedUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        style={{ padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                                        value={teamFilter || 'All'}
                                        onChange={(e) => setTeamFilter(e.target.value)}
                                    >
                                        <option value="All">All Teams</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Second Row: Date Filters */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'flex-end',
                                    padding: '12px 16px',
                                    background: 'var(--gray-50)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--gray-200)'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            setStartDate(today);
                                            setEndDate(today);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            border: '1px solid var(--primary-500)',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            background: 'white',
                                            color: 'var(--primary-500)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap',
                                            height: '40px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--primary-500)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.color = 'var(--primary-500)';
                                        }}
                                    >
                                        Today
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--gray-700)' }}>From Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '9px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                background: 'white',
                                                height: '40px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--gray-700)' }}>To Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '9px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                background: 'white',
                                                height: '40px'
                                            }}
                                        />
                                    </div>
                                    {(startDate || endDate) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                            }}
                                            style={{
                                                padding: '10px 16px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                background: 'white',
                                                color: 'var(--gray-600)',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                height: '40px'
                                            }}
                                        >
                                            Clear Dates
                                        </button>
                                    )}
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
                                                <th>Created By</th>
                                                <th>Team</th>
                                                <th>Patient Name</th>
                                                <th>Contact</th>
                                                <th>Status</th>

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
                                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                                            {lead.created_by_name || 'Unknown'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                                                            {lead.team_name || <span style={{ fontStyle: 'italic', color: 'var(--gray-400)' }}>No Team</span>}
                                                        </div>
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
                                                            {/* Delete Icon - Super Admin only */}
                                                            {currentUser?.role_id === 1 && (
                                                                <button
                                                                    onClick={() => handleDeleteLead(lead.id, `${lead.first_name} ${lead.last_name}`)}
                                                                    className="btn-icon"
                                                                    title="Delete Lead"
                                                                    style={{
                                                                        textDecoration: 'none',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        padding: '8px',
                                                                        borderRadius: '6px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'var(--danger-500)',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = 'var(--danger-50)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                    </svg>
                                                                </button>
                                                            )}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                            Showing {startIndex + 1} to {endIndex} of {totalLeads} leads
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: '500' }}>Per page:</label>
                                            <select
                                                value={itemsPerPage}
                                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    background: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
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
                                            const maxVisiblePages = 7; // Show max 7 page buttons

                                            if (totalPages <= maxVisiblePages) {
                                                // Show all pages if total is small
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
                                                // Smart pagination with ellipsis
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

                                                // Show ellipsis if current page is far from start
                                                if (currentPage > 3) {
                                                    pageButtons.push(
                                                        <span key="ellipsis-start" style={{ padding: '8px 4px', color: 'var(--gray-500)' }}>...</span>
                                                    );
                                                }

                                                // Show pages around current page
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

                                                // Show ellipsis if current page is far from end
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
