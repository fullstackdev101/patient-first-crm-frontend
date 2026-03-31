"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLeadsStore } from "@/store";
import { useAuthStore } from "@/store";
import {
  maskSSN,
  maskPhone,
  maskAccountNumber,
  maskRoutingNumber,
  unmask,
} from "@/lib/inputMask";
import {
  INITIAL_FORM_DATA,
  DOBSelects,
  HealthQuestionnaire,
  validateSensitiveSecrets,
  type FormData,
} from "../lead-form-helpers";

export default function AddLeadPage() {
  const router = useRouter();
  const { createLead, isLoading, error, clearError } = useLeadsStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const change = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const requiredFields = [
      "first_name",
      "last_name",
      "dob_month",
      "dob_day",
      "dob_year",
      "phone",
      "email",
      "address",
      "state_of_birth",
      "ssn",
      "beneficiary_details",
      "plan_details",
      "bank_name",
      "account_name",
      "account_number",
      "routing_number",
    ];

    const newErrors: Record<string, boolean> = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all required fields");
      return;
    }

    // Sensitive Data Validation (Credit Card, CVV, Expiry)
    const sensitiveCheck = validateSensitiveSecrets(formData);
    if (sensitiveCheck) {
      alert(sensitiveCheck);
      return;
    }

    try {
      const {
        hospitalized_nursing_oxygen_cancer_assistance,
        organ_transplant_terminal_condition,
        aids_hiv_immune_deficiency,
        diabetes_complications_insulin,
        kidney_disease_multiple_cancers,
        pending_tests_surgery_hospitalization,
        angina_stroke_lupus_copd_hepatitis,
        heart_attack_aneurysm_surgery,
        cancer_treatment_2years,
        substance_abuse_treatment,
        cardiovascular_events_3years,
        cancer_respiratory_liver_3years,
        neurological_conditions_3years,
        health_comments,
        nicotine_user,
        existing_policy,
        covid_question,
        dob_month,
        dob_day,
        dob_year,
        ...otherFormData
      } = formData;

      const date_of_birth =
        dob_year && dob_month && dob_day
          ? `${dob_year}-${dob_month.padStart(2, "0")}-${dob_day.padStart(2, "0")}`
          : "";

      const leadData = {
        ...otherFormData,
        date_of_birth,
        ssn: unmask(formData.ssn),
        phone: unmask(formData.phone),
        doctor_phone: formData.doctor_phone ? unmask(formData.doctor_phone) : "",
        account_number: unmask(formData.account_number),
        routing_number: unmask(formData.routing_number),
        status: 1,    // Statuses: 1 for New, 3 for QA Review
        hospitalized_nursing_oxygen_cancer_assistance:
          hospitalized_nursing_oxygen_cancer_assistance === "yes",
        organ_transplant_terminal_condition:
          organ_transplant_terminal_condition === "yes",
        aids_hiv_immune_deficiency: aids_hiv_immune_deficiency === "yes",
        diabetes_complications_insulin: diabetes_complications_insulin === "yes",
        kidney_disease_multiple_cancers: kidney_disease_multiple_cancers === "yes",
        pending_tests_surgery_hospitalization:
          pending_tests_surgery_hospitalization === "yes",
        angina_stroke_lupus_copd_hepatitis: angina_stroke_lupus_copd_hepatitis === "yes",
        heart_attack_aneurysm_surgery: heart_attack_aneurysm_surgery === "yes",
        cancer_treatment_2years: cancer_treatment_2years === "yes",
        substance_abuse_treatment: substance_abuse_treatment === "yes",
        cardiovascular_events_3years: cardiovascular_events_3years === "yes",
        cancer_respiratory_liver_3years: cancer_respiratory_liver_3years === "yes",
        neurological_conditions_3years: neurological_conditions_3years === "yes",
        health_comments,
        nicotine_user,
        existing_policy: existing_policy === "yes",
        covid_question: covid_question === "yes",
      };

      await createLead(leadData);
      alert("Lead created successfully!");

      const userRoleId = user?.role_id;
      if (userRoleId === 3) {
        // router.push("/leads/agent-leads");
        router.push("/dashboard");
      } else {
        router.push("/leads");
      }
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        error ||
        "Failed to create lead. Please try again."
      );
    }
  };

  const userRoleId = user?.role_id;
  const leadsListPath =
    userRoleId === 3 || userRoleId === 4 ? "/leads/agent-leads" : "/leads";

  return (
    <ProtectedRoute>
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="content">
            <div style={{ maxWidth: "1000px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <Link href={leadsListPath} className="btn-icon" style={{ width: "40px", height: "40px" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h2 className="page-title">Add New Lead</h2>
                  <p className="page-subtitle">Fill in the patient information below</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Personal Information</h3>
                  </div>
                  <div className="card-content">
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "16px",
                      }}
                    >

                      {/* Full Name Row - Spanning 2 columns to fit 3 fields in one line */}
                      <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: "12px" }}>
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input type="text" className="form-input" required value={formData.first_name}
                            onChange={(e) => change("first_name", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Middle Initial</label>
                          <input type="text" className="form-input" maxLength={1} value={formData.middle_initial}
                            onChange={(e) => change("middle_initial", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input type="text" className="form-input" required value={formData.last_name}
                            onChange={(e) => change("last_name", e.target.value)} />
                        </div>
                      </div>

                      {/* DOB and Contact */}
                      <div className="form-group">
                        <label className="form-label">
                          Date of Birth <span className="required-indicator">*</span>
                        </label>
                        <DOBSelects
                          month={formData.dob_month}
                          day={formData.dob_day}
                          year={formData.dob_year}
                          onMonthChange={(v) => change("dob_month", v)}
                          onDayChange={(v) => change("dob_day", v)}
                          onYearChange={(v) => change("dob_year", v)}
                        />
                      </div>

                      <div className={`form-group ${errors.phone ? "error" : ""}`}>
                        <label className="form-label">
                          Phone <span className="required-indicator">*</span>
                        </label>
                        <input type="tel" className="form-input" placeholder="(555) 123-4567" required
                          value={formData.phone}
                          onChange={(e) => change("phone", maskPhone(e.target.value))} />
                      </div>

                      {/* Address Section */}
                      <div className="form-group">
                        <label className="form-label">Street Address</label>
                        <input type="text" className="form-input" value={formData.address}
                          onChange={(e) => change("address", e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Apartment / Lot Number *</label>
                        <input type="text" className="form-input" required value={formData.apt_lot}
                          onChange={(e) => change("apt_lot", e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-input" value={formData.city}
                          onChange={(e) => change("city", e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">State</label>
                        <select
                          className="form-input"
                          value={formData.state}
                          onChange={(e) => change("state", e.target.value)}
                        >
                          <option value="">Select State</option>
                          {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Zipcode *</label>
                        <input type="text" className="form-input" required value={formData.zipcode}
                          onChange={(e) => change("zipcode", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-input" placeholder="patient@email.com" required
                          value={formData.email} onChange={(e) => change("email", e.target.value)} />
                      </div>

                      {/* SSN */}
                      <div className={`form-group ${errors.ssn ? "error" : ""}`}>
                        <label className="form-label">
                          Social Security Number <span className="required-indicator">*</span>
                        </label>
                        <input type="text" className="form-input" placeholder="XXX-XX-XXXX" required
                          value={formData.ssn}
                          onChange={(e) => change("ssn", maskSSN(e.target.value))} />
                      </div>



                      <div className="form-group">
                        <label className="form-label">State of Birth *</label>
                        <input type="text" className="form-input" required value={formData.state_of_birth}
                          onChange={(e) => change("state_of_birth", e.target.value)} />
                      </div>

                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Medical Information</h3>
                  </div>
                  <div className="card-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Height</label>
                        <input type="text" className="form-input" placeholder="e.g., 5'10&quot;" value={formData.height}
                          onChange={(e) => change("height", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Weight</label>
                        <input type="text" className="form-input" placeholder="e.g., 180 lbs" value={formData.weight}
                          onChange={(e) => change("weight", e.target.value)} />
                      </div>
                      {/* <div className="form-group">
                        <label className="form-label">Insurance Provider</label>
                        <input type="text" className="form-input" value={formData.insurance_provider}
                          onChange={(e) => change("insurance_provider", e.target.value)} />
                      </div> */}
                      {/* Carriers Dropdown */}
                      <div className="form-group">
                        <label className="form-label">Carriers</label>
                        <select
                          className="form-input"
                          required
                          value={formData.insurance_provider}
                          onChange={(e) => change("insurance_provider", e.target.value)}
                        >
                          <option value="">Select Carrier</option>
                          <option value="TransAmerica">TransAmerica</option>
                          <option value="AMAM">AMAM</option>
                          <option value="RNA">RNA</option>
                          <option value="Americo">Americo</option>
                          <option value="Aetna">Aetna</option>
                          <option value="MOO">MOO</option>
                          <option value="Corbridge">Corbridge</option>
                          <option value="CICA">CICA</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Policy Number</label>
                        <input type="text" className="form-input" value={formData.policy_number}
                          onChange={(e) => change("policy_number", e.target.value)} />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Medical Notes</label>
                        <textarea className="form-input" rows={3}
                          placeholder="Any relevant medical history or notes..."
                          value={formData.medical_notes}
                          onChange={(e) => change("medical_notes", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Doctor Information</h3>
                  </div>
                  <div className="card-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Doctor Name</label>
                        <input type="text" className="form-input" value={formData.doctor_name}
                          onChange={(e) => change("doctor_name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Doctor Phone</label>
                        <input type="tel" className="form-input" placeholder="(555) 123-4567"
                          value={formData.doctor_phone}
                          onChange={(e) => change("doctor_phone", maskPhone(e.target.value))} />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Doctor Address</label>
                        <input type="text" className="form-input" value={formData.doctor_address}
                          onChange={(e) => change("doctor_address", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beneficiary Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Beneficiary Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label className="form-label">Beneficiary Details *</label>
                      <textarea className="form-input" rows={4} required
                        placeholder="Enter beneficiary name(s), their relationship to you, and coverage percentage for each beneficiary"
                        value={formData.beneficiary_details}
                        onChange={(e) => change("beneficiary_details", e.target.value)} />
                      <p style={{ fontSize: "13px", color: "var(--gray-600)", marginTop: "8px" }}>
                        Please list all beneficiaries with their full names, relationship to you (e.g., spouse, child, parent), and the percentage of coverage allocated to each. For example: &quot;John Doe (Spouse) - 50%, Jane Doe (Daughter) - 50%&quot;. Ensure the total coverage adds up to 100%.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Plan Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label className="form-label">Plan Details *</label>
                      <textarea className="form-input" rows={4} required
                        placeholder="Enter your insurance plan details including plan name, policy number, coverage type, and any additional plan information"
                        value={formData.plan_details}
                        onChange={(e) => change("plan_details", e.target.value)} />
                      <p style={{ fontSize: "13px", color: "var(--gray-600)", marginTop: "8px" }}>
                        Please provide comprehensive information about your insurance plan including the plan name, policy number, type of coverage (e.g., HMO, PPO), deductible amount, and any other relevant plan details.
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Why quoted.. Immediate/Graded/ROP</label>
                      <textarea className="form-input" rows={3}
                        placeholder="Specify the quote type: Immediate Death Benefit, Graded Death Benefit, or Return of Premium (ROP)"
                        value={formData.quote_type}
                        onChange={(e) => change("quote_type", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Health Questionnaire */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Health Questionnaire</h3>
                  </div>
                  <div className="card-content">
                    <HealthQuestionnaire formData={formData} onChange={change} />
                  </div>
                </div>

                {/* Additional Health Questions row (Nicotine/Existing Policy) */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Additional Health Information</h3>
                  </div>
                  <div className="card-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                      <div className="form-group">
                        <label className="form-label">Nicotine User</label>
                        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                          {["smoker", "non-smoker"].map((opt) => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                              <input type="radio" name="nicotine_user" value={opt}
                                style={{ width: "18px", height: "18px" }}
                                checked={formData.nicotine_user === opt}
                                onChange={(e) => change("nicotine_user", e.target.value)} />
                              <span>{opt === "smoker" ? "Smoker" : "Non-Smoker"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Does Insured person already have a existing policy?</label>
                        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                          {["yes", "no"].map((opt) => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                              <input type="radio" name="existing_policy" value={opt}
                                style={{ width: "18px", height: "18px" }}
                                checked={formData.existing_policy === opt}
                                onChange={(e) => change("existing_policy", e.target.value)} />
                              <span>{opt === "yes" ? "Yes" : "No"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coronavirus Questionnaire */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Coronavirus Questionnaire</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label className="form-label">
                        Within the past 6 months, have you been hospitalized or diagnosed by a medical professional with ongoing medical complications due to the novel coronavirus (COVID-19) or are you currently diagnosed by a medical professional with or being treated for the novel coronavirus (COVID-19)?
                      </label>
                      <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                        {["yes", "no"].map((opt) => (
                          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input type="radio" name="covid_question" value={opt}
                              style={{ width: "18px", height: "18px" }}
                              checked={formData.covid_question === opt}
                              onChange={(e) => change("covid_question", e.target.value)} />
                            <span>{opt === "yes" ? "Yes" : "No"}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Banking Information</h3>
                  </div>
                  <div className="card-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Name of Bank *</label>
                        <input type="text" className="form-input" required value={formData.bank_name}
                          onChange={(e) => change("bank_name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Name on Account *</label>
                        <input type="text" className="form-input" required value={formData.account_name}
                          onChange={(e) => change("account_name", e.target.value)} />
                      </div>
                      <div className={`form-group ${errors.account_number ? "error" : ""}`}>
                        <label className="form-label">
                          Account Number <span className="required-indicator">*</span>
                        </label>
                        <input type="text" className="form-input" placeholder="Account number" required
                          value={formData.account_number}
                          onChange={(e) => change("account_number", maskAccountNumber(e.target.value))} />
                      </div>
                      <div className={`form-group ${errors.routing_number ? "error" : ""}`}>
                        <label className="form-label">
                          Routing Number <span className="required-indicator">*</span>
                        </label>
                        <input type="text" className="form-input" placeholder="9 digits" maxLength={9} required
                          value={formData.routing_number}
                          onChange={(e) => change("routing_number", maskRoutingNumber(e.target.value))} />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Account Type *</label>
                        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                          {[
                            { value: "checking", label: "Checking" },
                            { value: "saving", label: "Saving" },
                          ].map((opt) => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                              <input type="radio" name="account_type" value={opt.value} required
                                style={{ width: "18px", height: "18px" }}
                                checked={formData.account_type === opt.value}
                                onChange={(e) => change("account_type", e.target.value)} />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Comments</label>
                        <textarea className="form-input" rows={3}
                          placeholder="Enter any additional comments or special instructions regarding your banking information"
                          value={formData.banking_comments}
                          onChange={(e) => change("banking_comments", e.target.value)} />
                        <p style={{ fontSize: "13px", color: "var(--gray-600)", marginTop: "8px" }}>
                          Please provide any additional information or special instructions related to your banking details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draft Fields */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Draft Information</h3>
                  </div>
                  <div className="card-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Initial Draft</label>
                        <textarea className="form-input" rows={4} placeholder="Enter initial draft notes..."
                          value={formData.initial_draft}
                          onChange={(e) => change("initial_draft", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Future Draft</label>
                        <textarea className="form-input" rows={4} placeholder="Enter future draft notes..."
                          value={formData.future_draft}
                          onChange={(e) => change("future_draft", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
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
