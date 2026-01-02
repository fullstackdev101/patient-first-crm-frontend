'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import Topbar from '../../../components/Topbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useLeadsStore } from '@/store';
import { maskSSN, maskPhone, maskAccountNumber, maskRoutingNumber } from '@/lib/inputMask';
import axios from '@/lib/axios';

export default function ViewLeadPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;

    const { fetchLeadById, currentLead, isLoading } = useLeadsStore();

    const [statuses, setStatuses] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number>(1);

    // Fetch lead data on mount
    useEffect(() => {
        fetchLeadById(leadId);
    }, [leadId, fetchLeadById]);

    // Update selected status when lead loads
    useEffect(() => {
        if (currentLead) {
            setSelectedStatus(currentLead.status || 1);
        }
    }, [currentLead]);

    // Fetch statuses
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

    // Fetch comments
    useEffect(() => {
        if (leadId) {
            const fetchComments = async () => {
                try {
                    const response = await axios.get(`/leads/${leadId}/comments`);
                    if (response.data.success) {
                        setComments(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching comments:', error);
                }
            };
            fetchComments();
        }
    }, [leadId]);

    const handleStatusChange = async (newStatus: number) => {
        try {
            const response = await axios.put(`/leads/${leadId}`, {
                status: newStatus,
            });

            if (response.data.success) {
                setSelectedStatus(newStatus);
                alert('Status updated successfully!');
                // Refresh lead data
                fetchLeadById(leadId);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setIsSubmittingComment(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id || user?.user_id || user?.userId || 1;

            const response = await axios.post(`/leads/${leadId}/comments`, {
                user_id: userId,
                comment: newComment,
            });

            const data = response.data;

            if (data.success) {
                setComments([data.data, ...comments]);
                setNewComment('');
                alert('Comment added successfully!');
            } else {
                throw new Error(data.message || 'Failed to add comment');
            }
        } catch (error: any) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment. Please try again.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (isLoading || !currentLead) {
        return (
            <ProtectedRoute>
                <div className="dashboard-container">
                    <Sidebar />
                    <div className="main-content">
                        <Topbar />
                        <main className="content">
                            <div style={{ padding: '48px', textAlign: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--gray-500)' }}>
                                    Loading lead information...
                                </div>
                            </div>
                        </main>
                    </div >
                </div >
            </ProtectedRoute >
        );
    }

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <Topbar />
                    <main className="content">
                        {/* Page Header */}
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 className="page-title">View Lead: {currentLead.first_name} {currentLead.last_name}</h2>
                                <p className="page-subtitle">Read-only lead information</p>
                            </div >
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Link
                                    href="/leads"
                                    className="btn-secondary"
                                    style={{ textDecoration: 'none', padding: '10px 20px', border: '1px solid var(--gray-300)', borderRadius: '8px', background: 'white', color: 'var(--gray-700)', fontSize: '14px', fontWeight: '500' }}
                                >
                                    ← Back to Leads
                                </Link>
                                <Link
                                    href={`/leads/${leadId}`}
                                    className="btn-primary"
                                    style={{ textDecoration: 'none', padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }
                                    }
                                >
                                    Edit Lead
                                </Link >
                            </div >
                        </div >

                        {/* Main Content Grid */}
                        < div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            {/* Left Column - Lead Information */}
                            <div>
                                {/* Personal Information */}
                                <div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Personal Information</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '24px' }}>
                                        < div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <ReadOnlyField label="First Name" value={currentLead.first_name} />
                                            < ReadOnlyField label="Last Name" value={currentLead.last_name} />
                                            < ReadOnlyField label="Middle Initial" value={currentLead.middle_initial} />
                                            < ReadOnlyField label="Date of Birth" value={currentLead.date_of_birth} />
                                            < ReadOnlyField label="Phone" value={currentLead.phone ? maskPhone(currentLead.phone) : ''} />
                                            < ReadOnlyField label="Email" value={currentLead.email} />
                                            < ReadOnlyField label="State of Birth" value={currentLead.state_of_birth} />
                                            < ReadOnlyField label="SSN" value={currentLead.ssn ? maskSSN(currentLead.ssn) : ''} />
                                        </div >
                                        <div style={{ marginTop: '20px' }}>
                                            <ReadOnlyField label="Address" value={currentLead.address} />
                                        </div>
                                    </div >
                                </div >

                                {/* Medical Information */}
                                < div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Medical Information</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '24px' }}>
                                        < div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <ReadOnlyField label="Height" value={currentLead.height} />
                                            < ReadOnlyField label="Weight" value={currentLead.weight} />
                                            < ReadOnlyField label="Insurance Provider" value={currentLead.insurance_provider} />
                                            < ReadOnlyField label="Policy Number" value={currentLead.policy_number} />
                                        </div >
                                        <div style={{ marginTop: '20px' }}>
                                            <ReadOnlyField label="Medical Notes" value={currentLead.medical_notes} multiline />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                            <ReadOnlyField label="Doctor Name" value={currentLead.doctor_name} />
                                            <ReadOnlyField label="Doctor Phone" value={currentLead.doctor_phone ? maskPhone(currentLead.doctor_phone) : ''} />
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            <ReadOnlyField label="Doctor Address" value={currentLead.doctor_address} />
                                        </div>
                                    </div >
                                </div >

                                {/* Banking Information */}
                                < div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Banking Information</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '24px' }}>
                                        < div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <ReadOnlyField label="Bank Name" value={currentLead.bank_name} />
                                            < ReadOnlyField label="Account Name" value={currentLead.account_name} />
                                            < ReadOnlyField label="Account Number" value={currentLead.account_number ? maskAccountNumber(currentLead.account_number) : ''} />
                                            < ReadOnlyField label="Routing Number" value={currentLead.routing_number ? maskRoutingNumber(currentLead.routing_number) : ''} />
                                            < ReadOnlyField label="Account Type" value={currentLead.account_type} />
                                        </div >
                                        <div style={{ marginTop: '20px' }}>
                                            <ReadOnlyField label="Banking Comments" value={currentLead.banking_comments} multiline />
                                        </div>
                                    </div >
                                </div >

                                {/* Plan & Beneficiary */}
                                < div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Plan & Beneficiary Details</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '24px' }}>
                                        < ReadOnlyField label="Beneficiary Details" value={currentLead.beneficiary_details} multiline />
                                        < div style={{ marginTop: '20px' }}>
                                            <ReadOnlyField label="Plan Details" value={currentLead.plan_details} multiline />
                                        </div >
                                    </div >
                                </div >
                            </div >

                            {/* Right Column - Status & Comments */}
                            < div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
                                {/* Status Section */}
                                < div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Lead Status</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '20px' }}>
                                        < label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--gray-700)' }}>
                                            Change Status
                                        </label >
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid var(--gray-300)',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                background: 'white'
                                            }}
                                        >
                                            {statuses.map((status) => (
                                                <option key={status.id} value={status.id}>
                                                    {status.status_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div >
                                </div >

                                {/* Status Timeline */}
                                < div className="card" style={{ marginBottom: '24px' }}>
                                    < div className="card-header">
                                        < h3 className="card-title">Status Timeline</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '20px' }}>
                                        < div style={{ position: 'relative' }}>
                                            {/* Vertical Line */}
                                            < div style={{
                                                position: 'absolute',
                                                left: '19px',
                                                top: '10px',
                                                bottom: '10px',
                                                width: '2px',
                                                background: '#e5e7eb'
                                            }}></div >

                                            {/* Timeline Items */}
                                            {
                                                statuses.map((status, index) => {
                                                    const isActive = status.id === currentLead?.status;
                                                    const currentStatusIndex = statuses.findIndex(s => s.id === currentLead?.status);
                                                    const isPast = currentStatusIndex > -1 && currentStatusIndex > index;

                                                    return (
                                                        <div key={status.id} style={{
                                                            position: 'relative',
                                                            paddingLeft: '50px',
                                                            paddingBottom: index === statuses.length - 1 ? '0' : '24px'
                                                        }}>
                                                            {/* Circle */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: '10px',
                                                                top: '0',
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                border: `3px solid ${isActive ? '#14b8a6' : isPast ? '#14b8a6' : '#e5e7eb'}`,
                                                                background: isActive ? '#14b8a6' : isPast ? '#14b8a6' : 'white',
                                                                zIndex: 1
                                                            }}></div>

                                                            {/* Content */}
                                                            <div>
                                                                {/* Status Badge with Color */}
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    backgroundColor: (() => {
                                                                        switch (status.status_name) {
                                                                            case 'Approved':
                                                                                return '#d1fae5';
                                                                            case 'Pending':
                                                                                return '#fef3c7';
                                                                            case 'Manager Review':
                                                                            case 'Manage Review':
                                                                                return '#dbeafe';
                                                                            case 'QA Review':
                                                                                return '#e9d5ff';
                                                                            case 'Rejected':
                                                                                return '#fee2e2';
                                                                            case 'Entry':
                                                                                return '#f3f4f6';
                                                                            default:
                                                                                return '#f3f4f6';
                                                                        }
                                                                    })(),
                                                                    color: (() => {
                                                                        switch (status.status_name) {
                                                                            case 'Approved':
                                                                                return '#065f46';
                                                                            case 'Pending':
                                                                                return '#92400e';
                                                                            case 'Manager Review':
                                                                            case 'Manage Review':
                                                                                return '#1e40af';
                                                                            case 'QA Review':
                                                                                return '#6b21a8';
                                                                            case 'Rejected':
                                                                                return '#991b1b';
                                                                            case 'Entry':
                                                                                return '#4b5563';
                                                                            default:
                                                                                return '#4b5563';
                                                                        }
                                                                    })()
                                                                }}>
                                                                    {status.status_name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div >
                                    </div >
                                </div >

                                {/* Comments Section */}
                                < div className="card">
                                    < div className="card-header">
                                        < h3 className="card-title">Comments</h3>
                                    </div >
                                    <div className="card-content" style={{ padding: '20px' }}>
                                        {/* Add Comment */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: '80px',
                                                    padding: '10px 12px',
                                                    border: '1px solid var(--gray-300)',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                disabled={isSubmittingComment}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '8px 16px',
                                                    background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: isSubmittingComment ? 'not-allowed' : 'pointer',
                                                    opacity: isSubmittingComment ? 0.6 : 1
                                                }}
                                            >
                                                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                                            </button>
                                        </div>

                                        {/* Comments List */}
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {comments.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)', fontSize: '14px' }}>
                                                    No comments yet
                                                </div>
                                            ) : (
                                                comments.map((comment) => (
                                                    <div key={comment.id} style={{
                                                        padding: '12px',
                                                        background: 'var(--gray-50)',
                                                        borderRadius: '8px',
                                                        marginBottom: '12px'
                                                    }}>
                                                        <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '4px' }}>
                                                            {comment.user_name || 'Unknown User'} • {new Date(comment.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: 'var(--gray-800)' }}>
                                                            {comment.comment}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div >
                                </div >
                            </div >
                        </div >
                    </main >
                </div >
            </div >
        </ProtectedRoute >
    );
}

// Read-only field component
function ReadOnlyField({ label, value, multiline = false }: { label: string; value: any; multiline?: boolean }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--gray-600)' }}>
                {label}
            </label>
            <div style={{
                padding: multiline ? '12px' : '10px 12px',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--gray-800)',
                minHeight: multiline ? '80px' : 'auto',
                whiteSpace: multiline ? 'pre-wrap' : 'normal'
            }}>
                {value || '—'}
            </div>
        </div>
    );
}
