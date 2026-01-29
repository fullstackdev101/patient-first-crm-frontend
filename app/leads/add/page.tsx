'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useLeadsStore } from '@/store';
import { useAuthStore } from '@/store';
import { maskSSN, maskPhone, maskAccountNumber, maskRoutingNumber, unmask } from '@/lib/inputMask';

export default function AddLeadPage() {
    const router = useRouter();
    const { createLead, isLoading, error, clearError } = useLeadsStore();
    const { user } = useAuthStore();

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
        bank_name: '',
        account_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking',
        banking_comments: '',
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
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

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

        try {
            // Destructure to separate health questionnaire fields
            const {
                hospitalized_nursing_oxygen_cancer_assistance, organ_transplant_terminal_condition, aids_hiv_immune_deficiency,
                diabetes_complications_insulin, kidney_disease_multiple_cancers, pending_tests_surgery_hospitalization,
                angina_stroke_lupus_copd_hepatitis, heart_attack_aneurysm_surgery, cancer_treatment_2years, substance_abuse_treatment,
                cardiovascular_events_3years, cancer_respiratory_liver_3years, neurological_conditions_3years,
                health_comments, covid_question,
                ...otherFormData
            } = formData;

            // Unmask sensitive fields before sending to API
            const leadData = {
                ...otherFormData,
                ssn: unmask(formData.ssn),
                phone: unmask(formData.phone),
                doctor_phone: formData.doctor_phone ? unmask(formData.doctor_phone) : '',
                account_number: unmask(formData.account_number),
                routing_number: unmask(formData.routing_number),
                status: 1, // Default to New status (ID: 1)
                // Convert health questionnaire from yes/no to boolean
                hospitalized_nursing_oxygen_cancer_assistance: hospitalized_nursing_oxygen_cancer_assistance === 'yes',
                organ_transplant_terminal_condition: organ_transplant_terminal_condition === 'yes',
                aids_hiv_immune_deficiency: aids_hiv_immune_deficiency === 'yes',
                diabetes_complications_insulin: diabetes_complications_insulin === 'yes',
                kidney_disease_multiple_cancers: kidney_disease_multiple_cancers === 'yes',
                pending_tests_surgery_hospitalization: pending_tests_surgery_hospitalization === 'yes',
                angina_stroke_lupus_copd_hepatitis: angina_stroke_lupus_copd_hepatitis === 'yes',
                heart_attack_aneurysm_surgery: heart_attack_aneurysm_surgery === 'yes',
                cancer_treatment_2years: cancer_treatment_2years === 'yes',
                substance_abuse_treatment: substance_abuse_treatment === 'yes',
                cardiovascular_events_3years: cardiovascular_events_3years === 'yes',
                cancer_respiratory_liver_3years: cancer_respiratory_liver_3years === 'yes',
                neurological_conditions_3years: neurological_conditions_3years === 'yes',
                health_comments,
                covid_question: covid_question === 'yes',
            };

            await createLead(leadData);
            alert('Lead created successfully!');

            // Role-based redirect
            const userRoleId = user?.role_id;
            if (userRoleId === 3 || userRoleId === 4) {
                router.push('/leads-agent');
            } else {
                router.push('/leads');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || error || 'Failed to create lead. Please try again.');
        }
    };

    // Determine leads list path based on user role
    const userRoleId = user?.role_id;
    const leadsListPath = (userRoleId === 3 || userRoleId === 4) ? '/leads-agent' : '/leads';

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div style={{ maxWidth: '1000px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Link href={leadsListPath} className="btn-icon" style={{ width: '40px', height: '40px' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                </Link>
                                <div>
                                    <h2 className="page-title">Add New Lead</h2>
                                    <p className="page-subtitle">Fill in the patient information below</p>
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

                                {/* Form Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <Link href={leadsListPath} className="btn-secondary">Cancel</Link>
                                    <button type="submit" className="btn-primary">Create Lead</button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
