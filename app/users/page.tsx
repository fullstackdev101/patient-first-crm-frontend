'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store';
import { useTeamsStore } from '@/store/teamsStore';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // deletingId state removed - user deletion disabled
    const { user: currentUser } = useAuthStore();

    // Access control: Redirect Agent and License Agent users
    useEffect(() => {
        const userRoleId = currentUser?.role_id;
        if (userRoleId === 3 || userRoleId === 4) {
            router.replace('/dashboard');
        }
    }, [currentUser, router]);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10); // Changed from 5 to 10

    // Fetch teams
    const { teams, fetchTeams } = useTeamsStore();

    // Fetch users with search and pagination
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (selectedRole) {
                params.append('role_id', selectedRole);
            }

            if (selectedTeam) {
                params.append('team_id', selectedTeam);
            }

            const response = await axios.get(`/users?${params.toString()}`);
            if (response.data.success) {
                let fetchedUsers = response.data.data;

                // Filter out superadmin users if current user is not superadmin
                const currentUserRole = currentUser?.role?.trim().toLowerCase();
                if (currentUserRole !== 'superadmin') {
                    fetchedUsers = fetchedUsers.filter((user: any) => {
                        const userRole = user.role?.trim().toLowerCase();
                        return userRole !== 'superadmin';
                    });
                }

                setUsers(fetchedUsers);
                setTotalPages(response.data.pagination.totalPages);
                setTotal(response.data.pagination.total);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch roles for filter dropdown
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/roles');
                if (response.data.success) {
                    let fetchedRoles = response.data.data;

                    // Filter out superadmin role if current user is not superadmin
                    const currentUserRole = currentUser?.role?.trim().toLowerCase();
                    if (currentUserRole !== 'superadmin') {
                        fetchedRoles = fetchedRoles.filter((role: any) => {
                            return role.role?.trim().toLowerCase() !== 'superadmin';
                        });
                    }

                    setRoles(fetchedRoles);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, [currentUser]);

    // Fetch teams
    useEffect(() => {
        fetchTeams();
    }, []);

    // Fetch users when page, search, or filter changes
    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, selectedRole, selectedTeam]);

    // handleDelete function removed - user deletion disabled

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchUsers();
    };

    const handleRoleFilter = (roleId: string) => {
        setSelectedRole(roleId);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedTeam('');
        setCurrentPage(1);
    };

    const getStatusBadgeClass = (status: string) => {
        const trimmedStatus = status?.trim();
        return trimmedStatus === 'Active' || trimmedStatus === 'A' ? 'badge-success' : 'badge-default';
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleName = (roleId: number) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.role : 'Unknown';
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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

                        {/* Search and Filter Section */}
                        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                {/* Search Input */}
                                <div style={{ flex: '1', minWidth: '250px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--gray-300)',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Role Filter */}
                                <div style={{ minWidth: '200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                        Filter by Role
                                    </label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => handleRoleFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--gray-300)',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="">All Roles</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.role}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Team Filter */}
                                <div style={{ minWidth: '200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                        Filter by Team
                                    </label>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => {
                                            setSelectedTeam(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--gray-300)',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="">All Teams</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.id}>{team.team_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '10px 20px',
                                            background: 'var(--primary-500)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Search
                                    </button>
                                    {(searchTerm || selectedRole || selectedTeam) && (
                                        <button
                                            type="button"
                                            onClick={handleClearFilters}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'var(--gray-200)',
                                                color: 'var(--gray-700)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </form>
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
                                    <>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Team</th>
                                                    <th>Username</th>
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
                                                        <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-600)' }}>
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
                                                            <td>
                                                                <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                                                                    {user.team_name || <span style={{ fontStyle: 'italic', color: 'var(--gray-400)' }}>No Team</span>}
                                                                </div>
                                                            </td>
                                                            <td className="text-muted">{user.username}</td>
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
                                                                    {user.role || getRoleName(user.role_id)}
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
                                                                    {/* Hide Edit and Assign IP for Super Admin users */}
                                                                    {user.role_id !== 1 ? (
                                                                        <>
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
                                                                        </>
                                                                    ) : (
                                                                        <span style={{
                                                                            fontSize: '13px',
                                                                            color: '#9ca3af',
                                                                            fontStyle: 'italic',
                                                                            padding: '8px'
                                                                        }}>
                                                                            Protected
                                                                        </span>
                                                                    )}
                                                                    {/* Delete button removed - user deletion disabled */}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '20px',
                                                borderTop: '1px solid var(--gray-200)'
                                            }}>
                                                <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} users
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {/* Previous Button */}
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid var(--gray-300)',
                                                            borderRadius: '6px',
                                                            background: currentPage === 1 ? 'var(--gray-100)' : 'white',
                                                            color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
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
                                                                        onClick={() => setCurrentPage(i)}
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
                                                                    onClick={() => setCurrentPage(1)}
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
                                                                        onClick={() => setCurrentPage(i)}
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
                                                                    onClick={() => setCurrentPage(totalPages)}
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
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={currentPage === totalPages}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: '1px solid var(--gray-300)',
                                                            borderRadius: '6px',
                                                            background: currentPage === totalPages ? 'var(--gray-100)' : 'white',
                                                            color: currentPage === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
