'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useLeadsStore } from '@/store';
import { maskSSN, maskPhone, maskAccountNumber, maskRoutingNumber, unmask } from '@/lib/inputMask';
import axios from '@/lib/axios';

export default function EditLeadPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.id as string;

    const { fetchLeadById, currentLead, isLoading } = useLeadsStore();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_initial: '',
        date_of_birth: '',
        phone: '',
        email: '',
        address: '',
        state_of_birth: '',
        ssn: '',
        height: '',
        weight: '',
        insurance_provider: '',
        policy_number: '',
        medical_notes: '',
        doctor_name: '',
        doctor_phone: '',
        doctor_address: '',
        beneficiary_details: '',
        plan_details: '',
        quote_type: '',
        bank_name: '',
        account_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking',
        banking_comments: '',
        // Draft Fields
        initial_draft: '',
        future_draft: '',
        // Health Questionnaire
        hospitalized_nursing_oxygen_cancer_assistance: 'no',
        organ_transplant_terminal_condition: 'no',
        aids_hiv_immune_deficiency: 'no',
        diabetes_complications_insulin: 'no',
        kidney_disease_multiple_cancers: 'no',
        pending_tests_surgery_hospitalization: 'no',
        angina_stroke_lupus_copd_hepatitis: 'no',
        heart_attack_aneurysm_surgery: 'no',
        cancer_treatment_2years: 'no',
        substance_abuse_treatment: 'no',
        cardiovascular_events_3years: 'no',
        cancer_respiratory_liver_3years: 'no',
        neurological_conditions_3years: 'no',
        health_comments: '',
        covid_question: 'no',
        status: 1, // Status is now integer ID (default to Entry)
        assigned_to: '', // Add assigned_to field
    });

    // State for statuses and comments
    const [statuses, setStatuses] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [originalFormData, setOriginalFormData] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // Fetch lead data on mount
    useEffect(() => {
        fetchLeadById(leadId);
    }, [leadId, fetchLeadById]);

    // Populate form when lead data is loaded
    useEffect(() => {
        if (currentLead) {
            console.log('Populating form with lead data:', currentLead);
            setFormData({
                first_name: currentLead.first_name || '',
                last_name: currentLead.last_name || '',
                middle_initial: currentLead.middle_initial || '',
                date_of_birth: currentLead.date_of_birth || '',
                phone: currentLead.phone ? maskPhone(currentLead.phone) : '',
                email: currentLead.email || '',
                address: currentLead.address || '',
                state_of_birth: currentLead.state_of_birth || '',
                ssn: currentLead.ssn ? maskSSN(currentLead.ssn) : '',
                height: currentLead.height || '',
                weight: currentLead.weight || '',
                insurance_provider: currentLead.insurance_provider || '',
                policy_number: currentLead.policy_number || '',
                medical_notes: currentLead.medical_notes || '',
                doctor_name: currentLead.doctor_name || '',
                doctor_phone: currentLead.doctor_phone ? maskPhone(currentLead.doctor_phone) : '',
                doctor_address: currentLead.doctor_address || '',
                beneficiary_details: currentLead.beneficiary_details || '',
                plan_details: currentLead.plan_details || '',
                quote_type: currentLead.quote_type || '',
                bank_name: currentLead.bank_name || '',
                account_name: currentLead.account_name || '',
                account_number: currentLead.account_number ? maskAccountNumber(currentLead.account_number) : '',
                routing_number: currentLead.routing_number ? maskRoutingNumber(currentLead.routing_number) : '',
                account_type: (currentLead.account_type as 'checking' | 'saving' | 'direct_express') || 'checking',
                banking_comments: currentLead.banking_comments || '',
                // Draft Fields
                initial_draft: currentLead.initial_draft || '',
                future_draft: currentLead.future_draft || '',
                // Health Questionnaire - convert boolean to yes/no
                hospitalized_nursing_oxygen_cancer_assistance: currentLead.hospitalized_nursing_oxygen_cancer_assistance ? 'yes' : 'no',
                organ_transplant_terminal_condition: currentLead.organ_transplant_terminal_condition ? 'yes' : 'no',
                aids_hiv_immune_deficiency: currentLead.aids_hiv_immune_deficiency ? 'yes' : 'no',
                diabetes_complications_insulin: currentLead.diabetes_complications_insulin ? 'yes' : 'no',
                kidney_disease_multiple_cancers: currentLead.kidney_disease_multiple_cancers ? 'yes' : 'no',
                pending_tests_surgery_hospitalization: currentLead.pending_tests_surgery_hospitalization ? 'yes' : 'no',
                angina_stroke_lupus_copd_hepatitis: currentLead.angina_stroke_lupus_copd_hepatitis ? 'yes' : 'no',
                heart_attack_aneurysm_surgery: currentLead.heart_attack_aneurysm_surgery ? 'yes' : 'no',
                cancer_treatment_2years: currentLead.cancer_treatment_2years ? 'yes' : 'no',
                substance_abuse_treatment: currentLead.substance_abuse_treatment ? 'yes' : 'no',
                cardiovascular_events_3years: currentLead.cardiovascular_events_3years ? 'yes' : 'no',
                cancer_respiratory_liver_3years: currentLead.cancer_respiratory_liver_3years ? 'yes' : 'no',
                neurological_conditions_3years: currentLead.neurological_conditions_3years ? 'yes' : 'no',
                health_comments: currentLead.health_comments || '',
                covid_question: currentLead.covid_question ? 'yes' : 'no',
                status: currentLead.status || 1, // Status is now integer ID
                assigned_to: currentLead.assigned_to ? currentLead.assigned_to.toString() : '', // Use assigned_to for form
            });

            // Store original form data for comparison
            setOriginalFormData({
                first_name: currentLead.first_name || '',
                last_name: currentLead.last_name || '',
                middle_initial: currentLead.middle_initial || '',
                date_of_birth: currentLead.date_of_birth || '',
                phone: currentLead.phone ? maskPhone(currentLead.phone) : '',
                email: currentLead.email || '',
                address: currentLead.address || '',
                state_of_birth: currentLead.state_of_birth || '',
                ssn: currentLead.ssn ? maskSSN(currentLead.ssn) : '',
                height: currentLead.height || '',
                weight: currentLead.weight || '',
                insurance_provider: currentLead.insurance_provider || '',
                policy_number: currentLead.policy_number || '',
                medical_notes: currentLead.medical_notes || '',
                doctor_name: currentLead.doctor_name || '',
                doctor_phone: currentLead.doctor_phone ? maskPhone(currentLead.doctor_phone) : '',
                doctor_address: currentLead.doctor_address || '',
                beneficiary_details: currentLead.beneficiary_details || '',
                plan_details: currentLead.plan_details || '',
                quote_type: currentLead.quote_type || '',
                bank_name: currentLead.bank_name || '',
                account_name: currentLead.account_name || '',
                account_number: currentLead.account_number ? maskAccountNumber(currentLead.account_number) : '',
                routing_number: currentLead.routing_number ? maskRoutingNumber(currentLead.routing_number) : '',
                account_type: (currentLead.account_type as 'checking' | 'saving' | 'direct_express') || 'checking',
                banking_comments: currentLead.banking_comments || '',
                // Draft Fields
                initial_draft: currentLead.initial_draft || '',
                future_draft: currentLead.future_draft || '',
                hospitalized_nursing_oxygen_cancer_assistance: currentLead.hospitalized_nursing_oxygen_cancer_assistance ? 'yes' : 'no',
                organ_transplant_terminal_condition: currentLead.organ_transplant_terminal_condition ? 'yes' : 'no',
                aids_hiv_immune_deficiency: currentLead.aids_hiv_immune_deficiency ? 'yes' : 'no',
                diabetes_complications_insulin: currentLead.diabetes_complications_insulin ? 'yes' : 'no',
                kidney_disease_multiple_cancers: currentLead.kidney_disease_multiple_cancers ? 'yes' : 'no',
                pending_tests_surgery_hospitalization: currentLead.pending_tests_surgery_hospitalization ? 'yes' : 'no',
                angina_stroke_lupus_copd_hepatitis: currentLead.angina_stroke_lupus_copd_hepatitis ? 'yes' : 'no',
                heart_attack_aneurysm_surgery: currentLead.heart_attack_aneurysm_surgery ? 'yes' : 'no',
                cancer_treatment_2years: currentLead.cancer_treatment_2years ? 'yes' : 'no',
                substance_abuse_treatment: currentLead.substance_abuse_treatment ? 'yes' : 'no',
                cardiovascular_events_3years: currentLead.cardiovascular_events_3years ? 'yes' : 'no',
                cancer_respiratory_liver_3years: currentLead.cancer_respiratory_liver_3years ? 'yes' : 'no',
                neurological_conditions_3years: currentLead.neurological_conditions_3years ? 'yes' : 'no',
                health_comments: currentLead.health_comments || '',
                covid_question: currentLead.covid_question ? 'yes' : 'no',
                status: currentLead.status || 1,
                assigned_to: currentLead.assigned_to ? currentLead.assigned_to.toString() : '',
            });

            console.log('Form populated successfully');
        }
    }, [currentLead]);

    // Detect changes in form data
    useEffect(() => {
        if (originalFormData) {
            const changed = JSON.stringify(formData) !== JSON.stringify(originalFormData);
            setHasChanges(changed);
        }
    }, [formData, originalFormData]);

    // Fetch statuses on mount
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

    // Fetch comments when lead loads
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

    // Fetch status tracking history
    useEffect(() => {
        if (leadId) {
            const fetchStatusHistory = async () => {
                try {
                    const response = await axios.get(`/leads/${leadId}/status-history`);
                    if (response.data.success) {
                        setStatusHistory(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching status history:', error);
                }
            };
            fetchStatusHistory();
        }
    }, [leadId]);

    // Fetch users for assigned agent dropdown (exclude Agent role)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/users?exclude_role=Agent');
                if (response.data.success) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const newErrors: Record<string, boolean> = {};
        const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address', 'state_of_birth', 'ssn', 'beneficiary_details', 'plan_details', 'bank_name', 'account_name', 'account_number', 'routing_number'];

        requiredFields.forEach(field => {
            if (!formData[field as keyof typeof formData]) {
                newErrors[field] = true;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert('Please fill in all required fields');
            return;
        }

        setIsSaving(true); // Show full-page loader

        try {
            // Get user from localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            // Get user_id - check multiple possible properties
            let userId = null;
            if (user) {
                userId = user.id || user.user_id || user.userId || null;
            }

            console.log('📝 User from localStorage:', user);
            console.log('📝 Extracted user_id:', userId);

            // Unmask sensitive fields before sending to API
            const leadData = {
                ...formData,
                ssn: unmask(formData.ssn),
                phone: unmask(formData.phone),
                doctor_phone: formData.doctor_phone ? unmask(formData.doctor_phone) : '',
                account_number: unmask(formData.account_number),
                routing_number: unmask(formData.routing_number),
                status: formData.status, // Status is already an integer
                assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null, // Ensure assigned_to is integer or null
                user_id: userId, // Add user_id for activity tracking
            };

            // Get JWT token from localStorage (stored as 'authToken')
            const token = localStorage.getItem('authToken');
            console.log('🔐 Token check before PUT request:');
            console.log('   Token exists:', !!token);
            console.log('   Token value:', token ? token.substring(0, 20) + '...' : 'null');

            // Prepare headers
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('   ✅ Authorization header added');
                console.log('   Full headers:', headers);
            } else {
                console.log('   ⚠️ No token found in localStorage');
                console.log('   ⚠️ Authorization header will NOT be sent');
                console.log('   ⚠️ Backend will use fallback user_id: 1');
                console.log('   💡 TIP: Logout and login again to store token');
            }

            // apiClient automatically adds Authorization header via axios interceptor
            console.log('📤 Sending PUT request via apiClient (auto-adds Authorization header)...');
            const response = await axios.put(`/leads/${leadId}`, leadData);

            console.log('✅ Lead updated successfully!');

            // Refresh lead data from database
            await fetchLeadById(leadId);

            // Refresh status history
            try {
                const historyResponse = await axios.get(`/leads/${leadId}/status-history`);
                if (historyResponse.data.success) {
                    setStatusHistory(historyResponse.data.data);
                }
            } catch (error) {
                console.error('Error refreshing status history:', error);
            }

            // Refresh comments
            try {
                const commentsResponse = await axios.get(`/leads/${leadId}/comments`);
                if (commentsResponse.data.success) {
                    setComments(commentsResponse.data.data);
                }
            } catch (error) {
                console.error('Error refreshing comments:', error);
            }

            setIsSaving(false); // Hide loader
            setShowSuccessModal(true); // Show success modal

            // Reset originalFormData to match current (saved) state
            setOriginalFormData({ ...formData });
            setHasChanges(false);

            // Scroll to Save Changes button
            setTimeout(() => {
                saveButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            // Auto-hide success modal after 2 seconds
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);
        } catch (err: any) {
            console.error('Error updating lead:', err);
            setIsSaving(false); // Hide loader on error
            alert('Failed to update lead. Please try again.');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setIsSubmittingComment(true);
        try {
            // Get user ID from auth-storage (Zustand persist)
            const authStorageStr = localStorage.getItem('auth-storage');
            let userId = 1; // Default fallback

            if (authStorageStr) {
                try {
                    const authStorage = JSON.parse(authStorageStr);
                    userId = authStorage.state?.user?.id || 1;
                    console.log('✅ Got user ID from auth-storage:', userId);
                } catch (error) {
                    console.error('Error parsing auth-storage:', error);
                }
            }

            const response = await axios.post(`/leads/${leadId}/comments`, {
                comment: newComment,
                user_id: userId
            });

            const data = response.data;

            if (data.success) {
                // Add new comment to the list
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

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="dashboard-container">
                    <Sidebar />
                    <div className="main-content">
                        <Topbar />
                        <main className="content">
                            <div className="card">
                                <div className="card-content">
                                    <h3>Loading...</h3>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!currentLead) {
        return (
            <ProtectedRoute>
                <div className="dashboard-container">
                    <Sidebar />
                    <div className="main-content">
                        <Topbar />
                        <main className="content">
                            <div className="card">
                                <div className="card-content">
                                    <h3>Lead not found</h3>
                                    <Link href="/leads" className="btn-primary">Back to Leads</Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            {/* Full-Page Loading Overlay */}
            {isSaving && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid var(--gray-200)',
                            borderTop: '4px solid var(--primary-500)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }}></div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--gray-800)' }}>
                            Saving Changes...
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '8px' }}>
                            Please wait
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
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
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        minWidth: '300px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'var(--success-500)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--gray-800)' }}>
                            Information Saved!
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '8px' }}>
                            Lead updated successfully
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
                            {/* Left: Form - Fixed 1000px */}
                            <div style={{ width: '1000px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Link href="/leads" className="btn-icon" style={{ width: '40px', height: '40px' }}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                        </svg>
                                    </Link>
                                    <div>
                                        <h2 className="page-title">Edit Lead: {currentLead.first_name} {currentLead.last_name}</h2>
                                        <p className="page-subtitle">Lead ID: {leadId}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Personal Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">First Name *</label>
                                                    <input type="text" className="form-input" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Last Name *</label>
                                                    <input type="text" className="form-input" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Middle Initial</label>
                                                    <input type="text" className="form-input" maxLength={1} value={formData.middle_initial} onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Date of Birth *</label>
                                                    <input type="date" className="form-input" required value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                                                </div>
                                                <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                                                    <label className="form-label">Phone <span className="required-indicator">*</span></label>
                                                    <input type="tel" className="form-input" placeholder="(555) 123-4567" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email *</label>
                                                    <input type="email" className="form-input" placeholder="patient@email.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="form-label">Address *</label>
                                                    <input type="text" className="form-input" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">State of Birth *</label>
                                                    <input type="text" className="form-input" required value={formData.state_of_birth} onChange={(e) => setFormData({ ...formData, state_of_birth: e.target.value })} />
                                                </div>
                                                <div className={`form-group ${errors.ssn ? 'error' : ''}`}>
                                                    <label className="form-label">Social Security Number <span className="required-indicator">*</span></label>
                                                    <input type="text" className="form-input" placeholder="XXX-XX-XXXX" required value={formData.ssn} onChange={(e) => setFormData({ ...formData, ssn: maskSSN(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Medical Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Height</label>
                                                    <input type="text" className="form-input" placeholder="e.g., 5'10&quot;" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Weight</label>
                                                    <input type="text" className="form-input" placeholder="e.g., 180 lbs" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Insurance Provider</label>
                                                    <input type="text" className="form-input" value={formData.insurance_provider} onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Policy Number</label>
                                                    <input type="text" className="form-input" value={formData.policy_number} onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="form-label">Medical Notes</label>
                                                    <textarea className="form-input" rows={3} placeholder="Any relevant medical history or notes..." value={formData.medical_notes} onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Doctor Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Doctor Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Doctor Name</label>
                                                    <input type="text" className="form-input" value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Doctor Phone</label>
                                                    <input type="tel" className="form-input" placeholder="(555) 123-4567" value={formData.doctor_phone} onChange={(e) => setFormData({ ...formData, doctor_phone: maskPhone(e.target.value) })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="form-label">Doctor Address</label>
                                                    <input type="text" className="form-input" value={formData.doctor_address} onChange={(e) => setFormData({ ...formData, doctor_address: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Beneficiary Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Beneficiary Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div className="form-group">
                                                <label className="form-label">Beneficiary Details *</label>
                                                <textarea className="form-input" rows={4} placeholder="Enter beneficiary name(s), their relationship to you, and coverage percentage for each beneficiary" required value={formData.beneficiary_details} onChange={(e) => setFormData({ ...formData, beneficiary_details: e.target.value })}></textarea>
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>Please list all beneficiaries with their full names, relationship to you (e.g., spouse, child, parent), and the percentage of coverage allocated to each. For example: "John Doe (Spouse) - 50%, Jane Doe (Daughter) - 50%". Ensure the total coverage adds up to 100%.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Plan Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div className="form-group">
                                                <label className="form-label">Plan Details *</label>
                                                <textarea className="form-input" rows={4} placeholder="Enter your insurance plan details including plan name, policy number, coverage type, and any additional plan information" required value={formData.plan_details} onChange={(e) => setFormData({ ...formData, plan_details: e.target.value })}></textarea>
                                                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>Please provide comprehensive information about your insurance plan including the plan name, policy number, type of coverage (e.g., HMO, PPO), deductible amount, and any other relevant plan details.</p>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Why quoted.. Immediate/Graded/ROP</label>
                                                <textarea className="form-input" rows={3} placeholder="Specify the quote type: Immediate Death Benefit, Graded Death Benefit, or Return of Premium (ROP)" value={formData.quote_type} onChange={(e) => setFormData({ ...formData, quote_type: e.target.value })}></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Questionnaire */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Health Questionnaire</h3>
                                        </div>
                                        <div className="card-content">
                                            {/* Question 1 */}
                                            <div className="form-group">
                                                <label className="form-label">1. Are you currently hospitalized, confined to a nursing facility, a bed, or a wheelchair due to chronic illness or disease, currently using oxygen equipment to assist in breathing, receiving Hospice Care or home health care, or had an amputation caused by disease, or do you currently have any form of cancer (excluding basal cell skin cancer) diagnosed or treated by a medical professional, or do you require assistance (from anyone) with activities of daily living such as bathing, dressing, eating or toileting?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="hospitalized_nursing_oxygen_cancer_assistance" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.hospitalized_nursing_oxygen_cancer_assistance === 'yes'} onChange={(e) => setFormData({ ...formData, hospitalized_nursing_oxygen_cancer_assistance: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="hospitalized_nursing_oxygen_cancer_assistance" value="no" style={{ width: '18px', height: '18px' }} checked={formData.hospitalized_nursing_oxygen_cancer_assistance === 'no'} onChange={(e) => setFormData({ ...formData, hospitalized_nursing_oxygen_cancer_assistance: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 2 */}
                                            <div className="form-group">
                                                <label className="form-label">2. Have you had or been medically advised to have an organ transplant or kidney dialysis, or have you been medically diagnosed as having congestive heart failure (CHF), Alzheimer's, dementia, mental incapacity, Lou Gehrig's disease (ALS), liver failure, respiratory failure, or been diagnosed by a medical professional as having a terminal medical condition or end-stage disease that is expected to result in death in the next 12 months?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="organ_transplant_terminal_condition" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.organ_transplant_terminal_condition === 'yes'} onChange={(e) => setFormData({ ...formData, organ_transplant_terminal_condition: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="organ_transplant_terminal_condition" value="no" style={{ width: '18px', height: '18px' }} checked={formData.organ_transplant_terminal_condition === 'no'} onChange={(e) => setFormData({ ...formData, organ_transplant_terminal_condition: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 3 */}
                                            <div className="form-group">
                                                <label className="form-label">3. Have you been medically treated or diagnosed by a medical professional as having Acquired Immune Deficiency Syndrome (AIDS), AIDS related complex (ARC), or any immune deficiency related disorder or tested positive for the Human Immunodeficiency Virus (HIV)?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="aids_hiv_immune_deficiency" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.aids_hiv_immune_deficiency === 'yes'} onChange={(e) => setFormData({ ...formData, aids_hiv_immune_deficiency: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="aids_hiv_immune_deficiency" value="no" style={{ width: '18px', height: '18px' }} checked={formData.aids_hiv_immune_deficiency === 'no'} onChange={(e) => setFormData({ ...formData, aids_hiv_immune_deficiency: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div style={{ padding: '12px', background: 'var(--rose-100)', border: '1px solid var(--rose-500)', borderRadius: '8px', marginBottom: '16px' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--rose-800)', fontWeight: '600' }}>If any answer to questions 1 through 3 is answered "Yes" the Proposed Insured is not eligible for any coverage.</p>
                                            </div>

                                            {/* Question 4 */}
                                            <div className="form-group">
                                                <label className="form-label">4. Have you ever been medically diagnosed or treated for complications of diabetes, including insulin shock, diabetic coma, retinopathy (eye), nephropathy (kidney), neuropathy (nerve damage/pain), or used insulin prior to age 50?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="diabetes_complications_insulin" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.diabetes_complications_insulin === 'yes'} onChange={(e) => setFormData({ ...formData, diabetes_complications_insulin: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="diabetes_complications_insulin" value="no" style={{ width: '18px', height: '18px' }} checked={formData.diabetes_complications_insulin === 'no'} onChange={(e) => setFormData({ ...formData, diabetes_complications_insulin: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 5 */}
                                            <div className="form-group">
                                                <label className="form-label">5. Have you ever been medically diagnosed, treated or taken medication for renal insufficiency, kidney failure, chronic kidney disease, or more than one occurrence of cancer in your lifetime (excluding basal cell skin cancer)?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="kidney_disease_multiple_cancers" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.kidney_disease_multiple_cancers === 'yes'} onChange={(e) => setFormData({ ...formData, kidney_disease_multiple_cancers: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="kidney_disease_multiple_cancers" value="no" style={{ width: '18px', height: '18px' }} checked={formData.kidney_disease_multiple_cancers === 'no'} onChange={(e) => setFormData({ ...formData, kidney_disease_multiple_cancers: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 6 */}
                                            <div className="form-group">
                                                <label className="form-label">6. Within the past 2 years have you had any diagnostic testing (excluding tests related to Human Immunodeficiency Virus (HIV)), surgery, or hospitalization advised by a medical professional which has not been completed or for which the results have not been received?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="pending_tests_surgery_hospitalization" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.pending_tests_surgery_hospitalization === 'yes'} onChange={(e) => setFormData({ ...formData, pending_tests_surgery_hospitalization: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="pending_tests_surgery_hospitalization" value="no" style={{ width: '18px', height: '18px' }} checked={formData.pending_tests_surgery_hospitalization === 'no'} onChange={(e) => setFormData({ ...formData, pending_tests_surgery_hospitalization: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Question 7 */}
                                            <div className="form-group">
                                                <label className="form-label" style={{ marginBottom: '12px' }}>7. Within the past 2 years have you:</label>

                                                <div style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                                                    <label className="form-label">a. been medically diagnosed or treated for angina (chest pain), stroke or TIA, cardiomyopathy, systemic lupus (SLE), cirrhosis, Hepatitis C, chronic hepatitis, chronic pancreatitis, chronic obstructive pulmonary disease (COPD), emphysema, chronic bronchitis, or required oxygen equipment to assist in breathing?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="angina_stroke_lupus_copd_hepatitis" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.angina_stroke_lupus_copd_hepatitis === 'yes'} onChange={(e) => setFormData({ ...formData, angina_stroke_lupus_copd_hepatitis: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="angina_stroke_lupus_copd_hepatitis" value="no" style={{ width: '18px', height: '18px' }} checked={formData.angina_stroke_lupus_copd_hepatitis === 'no'} onChange={(e) => setFormData({ ...formData, angina_stroke_lupus_copd_hepatitis: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                                                    <label className="form-label">b. had a heart attack or aneurysm, or had or been medically advised to have any type of heart, brain or circulatory surgery (including, but not limited to a pacemaker insertion, defibrillator placement), or any procedure to improve circulation?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="heart_attack_aneurysm_surgery" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.heart_attack_aneurysm_surgery === 'yes'} onChange={(e) => setFormData({ ...formData, heart_attack_aneurysm_surgery: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="heart_attack_aneurysm_surgery" value="no" style={{ width: '18px', height: '18px' }} checked={formData.heart_attack_aneurysm_surgery === 'no'} onChange={(e) => setFormData({ ...formData, heart_attack_aneurysm_surgery: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                                                    <label className="form-label">c. been medically diagnosed, or treated, or taken medication for any form of cancer (excluding basal cell skin cancer)?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cancer_treatment_2years" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.cancer_treatment_2years === 'yes'} onChange={(e) => setFormData({ ...formData, cancer_treatment_2years: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cancer_treatment_2years" value="no" style={{ width: '18px', height: '18px' }} checked={formData.cancer_treatment_2years === 'no'} onChange={(e) => setFormData({ ...formData, cancer_treatment_2years: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ paddingLeft: '16px' }}>
                                                    <label className="form-label">d. used illegal drugs, abused alcohol or drugs, had or been recommended by a medical professional to have treatment or counseling for alcohol or drug use or been advised to discontinue use of alcohol or drugs?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="substance_abuse_treatment" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.substance_abuse_treatment === 'yes'} onChange={(e) => setFormData({ ...formData, substance_abuse_treatment: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="substance_abuse_treatment" value="no" style={{ width: '18px', height: '18px' }} checked={formData.substance_abuse_treatment === 'no'} onChange={(e) => setFormData({ ...formData, substance_abuse_treatment: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '12px', background: 'var(--amber-100)', border: '1px solid var(--amber-500)', borderRadius: '8px', marginBottom: '16px' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--amber-800)', fontWeight: '600' }}>If any answer to questions 4 through 7 is answered "Yes" the Proposed Insured should apply for the Return of Premium Death Benefit Plan.</p>
                                            </div>

                                            {/* Question 8 */}
                                            <div className="form-group">
                                                <label className="form-label" style={{ marginBottom: '12px' }}>8. Within the past 3 years have you been medically diagnosed or treated, or hospitalized for:</label>

                                                <div style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                                                    <label className="form-label">a. stroke, angina (chest pain), heart attack, aneurysm, heart or circulatory surgery or any procedure to improve circulation?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cardiovascular_events_3years" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.cardiovascular_events_3years === 'yes'} onChange={(e) => setFormData({ ...formData, cardiovascular_events_3years: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cardiovascular_events_3years" value="no" style={{ width: '18px', height: '18px' }} checked={formData.cardiovascular_events_3years === 'no'} onChange={(e) => setFormData({ ...formData, cardiovascular_events_3years: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                                                    <label className="form-label">b. or taken medication for any form of cancer (excluding basal cell skin cancer), emphysema, chronic bronchitis, chronic obstructive pulmonary disease (COPD), ulcerative colitis, cirrhosis, Hepatitis C, or liver disease?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cancer_respiratory_liver_3years" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.cancer_respiratory_liver_3years === 'yes'} onChange={(e) => setFormData({ ...formData, cancer_respiratory_liver_3years: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="cancer_respiratory_liver_3years" value="no" style={{ width: '18px', height: '18px' }} checked={formData.cancer_respiratory_liver_3years === 'no'} onChange={(e) => setFormData({ ...formData, cancer_respiratory_liver_3years: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div style={{ paddingLeft: '16px' }}>
                                                    <label className="form-label">c. paralysis of two or more extremities or cerebral palsy, multiple sclerosis, seizures, Parkinson's disease or muscular dystrophy?</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="neurological_conditions_3years" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.neurological_conditions_3years === 'yes'} onChange={(e) => setFormData({ ...formData, neurological_conditions_3years: e.target.value })} />
                                                            <span>Yes</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="neurological_conditions_3years" value="no" style={{ width: '18px', height: '18px' }} checked={formData.neurological_conditions_3years === 'no'} onChange={(e) => setFormData({ ...formData, neurological_conditions_3years: e.target.value })} />
                                                            <span>No</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '12px', background: 'var(--secondary-50)', border: '1px solid var(--secondary-500)', borderRadius: '8px', marginBottom: '16px' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--secondary-600)', fontWeight: '600' }}>If any answer to question 8 is answered "Yes" the Proposed Insured should apply for the Graded Death Benefit Plan.</p>
                                            </div>

                                            <div style={{ padding: '12px', background: 'var(--primary-50)', border: '1px solid var(--primary-500)', borderRadius: '8px', marginBottom: '16px' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: '600' }}>If all questions 1 through 8 are answered "No" the Proposed Insured should apply for the Immediate Death Benefit Plan.</p>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Comments</label>
                                                <textarea className="form-input" rows={3} placeholder="Enter any additional health-related comments" value={formData.health_comments} onChange={(e) => setFormData({ ...formData, health_comments: e.target.value })}></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coronavirus Questionnaire */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Coronavirus Questionnaire</h3>
                                        </div>
                                        <div className="card-content">
                                            <div className="form-group">
                                                <label className="form-label">Within the past 6 months, have you been hospitalized or diagnosed by a medical professional with ongoing medical complications due to the novel coronavirus (COVID-19) or are you currently diagnosed by a medical professional with or being treated for the novel coronavirus (COVID-19)?</label>
                                                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="covid_question" value="yes" style={{ width: '18px', height: '18px' }} checked={formData.covid_question === 'yes'} onChange={(e) => setFormData({ ...formData, covid_question: e.target.value })} />
                                                        <span>Yes</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input type="radio" name="covid_question" value="no" style={{ width: '18px', height: '18px' }} checked={formData.covid_question === 'no'} onChange={(e) => setFormData({ ...formData, covid_question: e.target.value })} />
                                                        <span>No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Banking Information */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Banking Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Name of Bank *</label>
                                                    <input type="text" className="form-input" required value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Name on Account *</label>
                                                    <input type="text" className="form-input" required value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} />
                                                </div>
                                                <div className={`form-group ${errors.account_number ? 'error' : ''}`}>
                                                    <label className="form-label">Account Number <span className="required-indicator">*</span></label>
                                                    <input type="text" className="form-input" placeholder="Account number" required value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: maskAccountNumber(e.target.value) })} />
                                                </div>
                                                <div className={`form-group ${errors.routing_number ? 'error' : ''}`}>
                                                    <label className="form-label">Routing Number <span className="required-indicator">*</span></label>
                                                    <input type="text" className="form-input" placeholder="9 digits" maxLength={9} required value={formData.routing_number} onChange={(e) => setFormData({ ...formData, routing_number: maskRoutingNumber(e.target.value) })} />
                                                </div>
                                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="form-label">Account Type *</label>
                                                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="account_type" value="checking" required style={{ width: '18px', height: '18px' }} checked={formData.account_type === 'checking'} onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })} />
                                                            <span>Checking</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="account_type" value="saving" required style={{ width: '18px', height: '18px' }} checked={formData.account_type === 'saving'} onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })} />
                                                            <span>Saving</span>
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                            <input type="radio" name="account_type" value="direct_express" required style={{ width: '18px', height: '18px' }} checked={formData.account_type === 'direct_express'} onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })} />
                                                            <span>Direct Express Card</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                    <label className="form-label">Comments</label>
                                                    <textarea className="form-input" rows={3} placeholder="Enter any additional comments or special instructions regarding your banking information" value={formData.banking_comments} onChange={(e) => setFormData({ ...formData, banking_comments: e.target.value })}></textarea>
                                                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>Please provide any additional information or special instructions related to your banking details.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Draft Fields */}
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <div className="card-header">
                                            <h3 className="card-title">Draft Information</h3>
                                        </div>
                                        <div className="card-content">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Initial Draft</label>
                                                    <textarea className="form-input" rows={4} placeholder="Enter initial draft notes..." value={formData.initial_draft} onChange={(e) => setFormData({ ...formData, initial_draft: e.target.value })}></textarea>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Future Draft</label>
                                                    <textarea className="form-input" rows={4} placeholder="Enter future draft notes..." value={formData.future_draft} onChange={(e) => setFormData({ ...formData, future_draft: e.target.value })}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Change Section - HIGHLIGHTED */}
                                    <div className="card" style={{
                                        marginBottom: '24px',
                                        border: '2px solid #14b8a6',
                                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                                        boxShadow: '0 4px 6px rgba(20, 184, 166, 0.1)'
                                    }}>
                                        <div className="card-header" style={{ borderBottom: '1px solid rgba(20, 184, 166, 0.1)' }}>
                                            <h3 className="card-title" style={{
                                                color: '#0f766e',
                                                fontWeight: '600',
                                                fontSize: '16px'
                                            }}>Change Lead Status</h3>
                                        </div>
                                        <div className="card-content">
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontWeight: '500', color: '#0f766e' }}>Lead Status</label>
                                                <select
                                                    className="form-input"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                                    style={{
                                                        borderColor: '#14b8a6',
                                                        borderWidth: '1px',
                                                        fontSize: '15px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {/* Not selected / null option */}
                                                    <option value="">-- Select Status --</option>
                                                    {/* Only show Pending, Approved, Rejected for manual selection */}
                                                    {statuses.filter(status => [5, 6, 7].includes(status.id)).map((status) => (
                                                        <option key={status.id} value={status.id}>
                                                            {status.status_name}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Assigned Agent Dropdown */}
                                                <div style={{ marginTop: '16px' }}>
                                                    <label className="form-label" style={{ fontWeight: '500', color: '#0f766e' }}>Assigned Agent</label>
                                                    <select
                                                        className="form-input"
                                                        value={formData.assigned_to || ''}
                                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                                        style={{
                                                            borderColor: '#14b8a6',
                                                            borderWidth: '1px',
                                                            fontSize: '15px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {users.map((user) => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.name} ({user.role || 'Agent'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div style={{
                                                    marginTop: '12px',
                                                    padding: '12px',
                                                    background: 'rgba(20, 184, 166, 0.05)',
                                                    borderLeft: '3px solid #14b8a6',
                                                    borderRadius: '4px'
                                                }}>
                                                    <p style={{
                                                        fontSize: '13px',
                                                        color: '#0f766e',
                                                        margin: 0,
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '16px', marginTop: '1px' }}>ℹ️</span>
                                                        <span>Status will be automatically assigned based on the assigned agent's role. You can manually change to Pending, Approved, or Rejected if needed.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <Link href="/leads" className="btn-secondary">Cancel</Link>
                                        <button
                                            ref={saveButtonRef}
                                            type="submit"
                                            className="btn-primary"
                                            disabled={!hasChanges}
                                            style={{
                                                opacity: hasChanges ? 1 : 0.5,
                                                cursor: hasChanges ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right: Sidebar - Fills remaining space */}
                            <div style={{ flex: 1, position: 'sticky', top: '24px', height: 'fit-content' }}>
                                {/* Workflow Section - Timeline Style */}
                                <div className="card" style={{ marginBottom: '24px' }}>
                                    <div className="card-header">
                                        <h3 className="card-title">Lead Status Timeline</h3>
                                    </div>
                                    <div className="card-content" style={{ padding: '20px' }}>
                                        {/* Timeline */}
                                        <div style={{ position: 'relative' }}>
                                            {/* Vertical Line */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '19px',
                                                top: '10px',
                                                bottom: '10px',
                                                width: '2px',
                                                background: '#e5e7eb'
                                            }}></div>

                                            {/* Timeline Items */}
                                            {statuses.map((status, index) => {
                                                // Use currentLead.status (DB value) not formData.status (dropdown selection)
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
                                                            border: `3px solid ${isActive ? '#10b981' : '#e5e7eb'}`,
                                                            background: isActive ? '#10b981' : 'white',
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
                                                                            return '#d1fae5'; // Light green
                                                                        case 'Pending':
                                                                            return '#fef3c7'; // Light yellow
                                                                        case 'Manager Review':
                                                                        case 'Manage Review':
                                                                            return '#dbeafe'; // Light blue
                                                                        case 'QA Review':
                                                                            return '#e9d5ff'; // Light purple
                                                                        case 'Rejected':
                                                                            return '#fee2e2'; // Light red
                                                                        case 'Entry':
                                                                            return '#f3f4f6'; // Light gray
                                                                        default:
                                                                            return '#f3f4f6';
                                                                    }
                                                                })(),
                                                                color: (() => {
                                                                    switch (status.status_name) {
                                                                        case 'Approved':
                                                                            return '#065f46'; // Dark green
                                                                        case 'Pending':
                                                                            return '#92400e'; // Dark yellow/orange
                                                                        case 'Manager Review':
                                                                        case 'Manage Review':
                                                                            return '#1e40af'; // Dark blue
                                                                        case 'QA Review':
                                                                            return '#6b21a8'; // Dark purple
                                                                        case 'Rejected':
                                                                            return '#991b1b'; // Dark red
                                                                        case 'Entry':
                                                                            return '#4b5563'; // Dark gray
                                                                        default:
                                                                            return '#4b5563';
                                                                    }
                                                                })()
                                                            }}>
                                                                {status.status_name}
                                                            </span>
                                                            {status.description && (
                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    color: '#9ca3af',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    {status.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Additional Info */}
                                        <div style={{
                                            marginTop: '20px',
                                            paddingTop: '16px',
                                            borderTop: '1px solid #e5e7eb'
                                        }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Assigned to</label>
                                                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                                                    {currentLead.assigned_user_name || 'Unassigned'}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Created</label>
                                                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                                                    {currentLead.created_at ? new Date(currentLead.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Comments</h3>
                                    </div>
                                    <div className="card-content">
                                        {/* Comments List */}
                                        <div style={{ marginBottom: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                                            {comments.length === 0 ? (
                                                <p style={{ fontSize: '14px', color: 'var(--gray-500)', textAlign: 'center', padding: '20px 0' }}>
                                                    No comments yet
                                                </p>
                                            ) : (
                                                comments.map((comment) => (
                                                    <div key={comment.id} style={{
                                                        marginBottom: '16px',
                                                        paddingBottom: '16px',
                                                        borderBottom: '1px solid var(--gray-200)'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                background: 'var(--primary-500)',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: '600',
                                                                fontSize: '14px'
                                                            }}>
                                                                {comment.user_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)' }}>
                                                                    {comment.user_name || 'Unknown User'}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                                                                    {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: 'var(--gray-700)', paddingLeft: '40px' }}>
                                                            {comment.comment}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Add Comment Form */}
                                        <div>
                                            <textarea
                                                className="form-input"
                                                rows={3}
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                style={{ marginBottom: '8px', fontSize: '14px' }}
                                            ></textarea>
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={handleAddComment}
                                                disabled={isSubmittingComment || !newComment.trim()}
                                                style={{ width: '100%' }}
                                            >
                                                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                                            </button>
                                        </div>
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
