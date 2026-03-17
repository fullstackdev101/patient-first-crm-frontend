"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLeadsStore, useAuthStore } from "@/store";
import {
  maskSSN,
  maskPhone,
  maskAccountNumber,
  maskRoutingNumber,
  unmask,
} from "@/lib/inputMask";
import axios from "@/lib/axios";
import {
  INITIAL_FORM_DATA,
  DOBSelects,
  HealthQuestionnaire,
  HEALTH_FIELD_NAMES,
  type FormData,
} from "../lead-form-helpers";

/** Build the formData object from a lead record (for both setFormData & setOriginalFormData) */
function buildFormDataFromLead(
  currentLead: any,
): FormData & {
  status: number;
  assigned_to: string;
  lead_manual_status: string;
} {
  const {
    dob_year = "",
    dob_month = "",
    dob_day = "",
  } = (() => {
    if (!currentLead.date_of_birth) return {};
    const [y, m, d] = currentLead.date_of_birth.split("-");
    return { dob_year: y || "", dob_month: m || "", dob_day: d || "" };
  })();

  const healthFields = Object.fromEntries(
    HEALTH_FIELD_NAMES.map((f) => [f, currentLead[f] ? "yes" : "no"]),
  );

  return {
    ...INITIAL_FORM_DATA,
    first_name: currentLead.first_name || "",
    last_name: currentLead.last_name || "",
    middle_initial: currentLead.middle_initial || "",
    date_of_birth: currentLead.date_of_birth || "",
    dob_year,
    dob_month,
    dob_day,
    phone: currentLead.phone ? maskPhone(currentLead.phone) : "",
    email: currentLead.email || "",
    address: currentLead.address || "",
    apt_lot: currentLead.apt_lot || "",
    city: currentLead.city || "",
    state: currentLead.state || "",
    zipcode: currentLead.zipcode || "",
    state_of_birth: currentLead.state_of_birth || "",
    ssn: currentLead.ssn ? maskSSN(currentLead.ssn) : "",
    height: currentLead.height || "",
    weight: currentLead.weight || "",
    insurance_provider: currentLead.insurance_provider || "",
    policy_number: currentLead.policy_number || "",
    medical_notes: currentLead.medical_notes || "",
    doctor_name: currentLead.doctor_name || "",
    doctor_phone: currentLead.doctor_phone
      ? maskPhone(currentLead.doctor_phone)
      : "",
    doctor_address: currentLead.doctor_address || "",
    beneficiary_details: currentLead.beneficiary_details || "",
    plan_details: currentLead.plan_details || "",
    quote_type: currentLead.quote_type || "",
    bank_name: currentLead.bank_name || "",
    account_name: currentLead.account_name || "",
    account_number: currentLead.account_number
      ? maskAccountNumber(currentLead.account_number)
      : "",
    routing_number: currentLead.routing_number
      ? maskRoutingNumber(currentLead.routing_number)
      : "",
    account_type:
      (currentLead.account_type as "checking" | "saving" | "direct_express") ||
      "checking",
    banking_comments: currentLead.banking_comments || "",
    initial_draft: currentLead.initial_draft || "",
    future_draft: currentLead.future_draft || "",
    health_comments: currentLead.health_comments || "",
    ...healthFields,
    status: currentLead.status || 1,
    assigned_to: currentLead.assigned_to
      ? currentLead.assigned_to.toString()
      : "",
    lead_manual_status: "",
  } as any;
}

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { fetchLeadById, currentLead, isLoading } = useLeadsStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<any>({
    ...INITIAL_FORM_DATA,
    status: 1,
    assigned_to: "",
    lead_manual_status: "",
  });
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [statuses, setStatuses] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Shorthand updater
  const change = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  // Fetch lead on mount
  useEffect(() => {
    fetchLeadById(leadId);
  }, [leadId, fetchLeadById]);

  // Populate form when lead loads — single source of truth via buildFormDataFromLead
  useEffect(() => {
    if (currentLead) {
      const populated = buildFormDataFromLead(currentLead);
      setFormData(populated);
      setOriginalFormData(populated);
    }
  }, [currentLead]);

  // Detect unsaved changes
  useEffect(() => {
    if (originalFormData) {
      setHasChanges(
        JSON.stringify(formData) !== JSON.stringify(originalFormData),
      );
    }
  }, [formData, originalFormData]);

  // Fetch statuses, comments, history, users
  useEffect(() => {
    axios
      .get("/statuses")
      .then((r) => {
        if (r.data.success) setStatuses(r.data.data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!leadId) return;
    axios
      .get(`/leads/${leadId}/comments`)
      .then((r) => {
        if (r.data.success) setComments(r.data.data);
      })
      .catch(() => { });
    axios
      .get(`/leads/${leadId}/status-history`)
      .then((r) => {
        if (r.data.success) setStatusHistory(r.data.data);
      })
      .catch(() => { });
  }, [leadId]);

  useEffect(() => {
    axios
      .get("/users?exclude_role=Agent")
      .then((r) => {
        if (r.data.success) setUsers(r.data.data);
      })
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // prevent duplicate submissions

    const requiredFields = [
      "first_name",
      "last_name",
      "dob_year",
      "dob_month",
      "dob_day",
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
    requiredFields.forEach((f) => {
      if (!formData[f]) newErrors[f] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const userStr = localStorage.getItem("user");
      const localUser = userStr ? JSON.parse(userStr) : null;
      const userId = localUser
        ? localUser.id || localUser.user_id || localUser.userId || null
        : null;

      const date_of_birth =
        formData.dob_year && formData.dob_month && formData.dob_day
          ? `${formData.dob_year}-${formData.dob_month}-${formData.dob_day}`
          : "";

      const leadData = {
        ...formData,
        date_of_birth,
        ssn: unmask(formData.ssn),
        phone: unmask(formData.phone),
        doctor_phone: formData.doctor_phone
          ? unmask(formData.doctor_phone)
          : "",
        account_number: unmask(formData.account_number),
        routing_number: unmask(formData.routing_number),
        status: formData.status,
        lead_manual_status: formData.lead_manual_status || null,
        user_id: userId,
      };

      const response = await axios.put(`/leads/${leadId}`, leadData);

      // Role-based redirect if status is approved/rejected
      const currentUser = useAuthStore.getState().user;
      if (response.data.success && currentUser) {
        if (
          (currentUser.role_id === 4 || currentUser.role_id === 5 || currentUser.role_id === 7) &&
          (formData.lead_manual_status === "approved" ||
            formData.lead_manual_status === "rejected")
        ) {
          router.replace("/leads");
          return; // stop here — no further API calls after redirect
        }
      }

      // Refresh lead + history + comments
      await fetchLeadById(leadId);
      axios
        .get(`/leads/${leadId}/status-history`)
        .then((r) => {
          if (r.data.success) setStatusHistory(r.data.data);
        })
        .catch(() => { });
      axios
        .get(`/leads/${leadId}/comments`)
        .then((r) => {
          if (r.data.success) setComments(r.data.data);
        })
        .catch(() => { });

      setIsSaving(false);
      setShowSuccessModal(true);
      setOriginalFormData({ ...formData });
      setHasChanges(false);

      setTimeout(() => {
        saveButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error updating lead:", err);
      setIsSaving(false);
      alert("Failed to update lead. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }
    setIsSubmittingComment(true);
    try {
      const authStorageStr = localStorage.getItem("auth-storage");
      let userId = 1;
      if (authStorageStr) {
        try {
          userId = JSON.parse(authStorageStr).state?.user?.id || 1;
        } catch { }
      }
      const response = await axios.post(`/leads/${leadId}/comments`, {
        comment: newComment,
        user_id: userId,
      });
      if (response.data.success) {
        setComments([response.data.data, ...comments]);
        setNewComment("");
        alert("Comment added successfully!");
      } else {
        throw new Error(response.data.message || "Failed to add comment");
      }
    } catch (error: any) {
      alert("Failed to add comment. Please try again.");
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
                  <Link href="/leads" className="btn-primary">
                    Back to Leads
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  const currentUser = useAuthStore.getState().user;
  return (
    <ProtectedRoute>
      {/* Full-Page Loading Overlay */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "var(--card-bg)",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid var(--gray-200)",
                borderTop: "4px solid var(--primary-500)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--gray-800)",
              }}
            >
              Saving Changes...
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--gray-500)",
                marginTop: "8px",
              }}
            >
              Please wait
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "var(--card-bg)",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              minWidth: "300px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "var(--success-500)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "var(--gray-800)",
              }}
            >
              Information Saved!
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--gray-500)",
                marginTop: "8px",
              }}
            >
              Lead updated successfully
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="content">
            <div style={{ display: "flex", gap: "24px", width: "100%" }}>
              {/* Left: Form */}
              <div style={{ width: "1000px", flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <Link
                    href="/leads"
                    className="btn-icon"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </Link>
                  <div>
                    <h2 className="page-title">
                      Edit Lead: {currentLead.first_name}{" "}
                      {currentLead.last_name}
                    </h2>
                    <p className="page-subtitle">Lead ID: {leadId}</p>
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
                            <input
                              type="text"
                              className="form-input"
                              required
                              value={formData.first_name}
                              onChange={(e) =>
                                change("first_name", e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Middle Initial</label>
                            <input
                              type="text"
                              className="form-input"
                              maxLength={1}
                              value={formData.middle_initial}
                              onChange={(e) =>
                                change("middle_initial", e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input
                              type="text"
                              className="form-input"
                              required
                              value={formData.last_name}
                              onChange={(e) =>
                                change("last_name", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Date of Birth{" "}
                            <span className="required-indicator">*</span>
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
                        <div
                          className={`form-group ${errors.phone ? "error" : ""}`}
                        >
                          <label className="form-label">
                            Phone <span className="required-indicator">*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="(555) 123-4567"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              change("phone", maskPhone(e.target.value))
                            }
                          />
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
                          <input
                            type="email"
                            className="form-input"
                            placeholder="patient@email.com"
                            required
                            value={formData.email}
                            onChange={(e) => change("email", e.target.value)}
                          />
                        </div>
                        <div
                          className={`form-group ${errors.ssn ? "error" : ""}`}>
                          <label className="form-label">
                            Social Security Number{" "}
                            <span className="required-indicator">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="XXX-XX-XXXX"
                            required
                            value={formData.ssn}
                            onChange={(e) =>
                              change("ssn", maskSSN(e.target.value))
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State of Birth *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.state_of_birth}
                            onChange={(e) =>
                              change("state_of_birth", e.target.value)
                            }
                          />
                        </div>
                        {/* Assigned To — for non-agent roles */}
                        {/*<div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label className="form-label">Assigned To</label>
                          <select className="form-input" value={formData.assigned_to} onChange={(e) => change("assigned_to", e.target.value)}>
                            <option value="">-- Unassigned --</option>
                            {users.map((u: any) => (
                              <option key={u.id} value={u.id}>{u.name || u.full_name || u.email}</option>
                            ))}
                          </select>
                        </div>
                        */}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="card" style={{ marginBottom: "24px" }}>
                    <div className="card-header">
                      <h3 className="card-title">Medical Information</h3>
                    </div>
                    <div className="card-content">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "16px",
                        }}
                      >
                        <div className="form-group">
                          <label className="form-label">Height</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 5'10&quot;"
                            value={formData.height}
                            onChange={(e) => change("height", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Weight</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 180 lbs"
                            value={formData.weight}
                            onChange={(e) => change("weight", e.target.value)}
                          />
                        </div>
                        {/* <div className="form-group">
                          <label className="form-label">
                            Insurance Provider
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.insurance_provider}
                            onChange={(e) =>
                              change("insurance_provider", e.target.value)
                            }
                          />
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
                          <input
                            type="text"
                            className="form-input"
                            value={formData.policy_number}
                            onChange={(e) =>
                              change("policy_number", e.target.value)
                            }
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "span 2" }}
                        >
                          <label className="form-label">Medical Notes</label>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Any relevant medical history or notes..."
                            value={formData.medical_notes}
                            onChange={(e) =>
                              change("medical_notes", e.target.value)
                            }
                          />
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
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "16px",
                        }}
                      >
                        <div className="form-group">
                          <label className="form-label">Doctor Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.doctor_name}
                            onChange={(e) =>
                              change("doctor_name", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Doctor Phone</label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="(555) 123-4567"
                            value={formData.doctor_phone}
                            onChange={(e) =>
                              change("doctor_phone", maskPhone(e.target.value))
                            }
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "span 2" }}
                        >
                          <label className="form-label">Doctor Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.doctor_address}
                            onChange={(e) =>
                              change("doctor_address", e.target.value)
                            }
                          />
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
                        <label className="form-label">
                          Beneficiary Details *
                        </label>
                        <textarea
                          className="form-input"
                          rows={4}
                          required
                          placeholder="Enter beneficiary name(s), their relationship to you, and coverage percentage for each beneficiary"
                          value={formData.beneficiary_details}
                          onChange={(e) =>
                            change("beneficiary_details", e.target.value)
                          }
                        />
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--gray-600)",
                            marginTop: "8px",
                          }}
                        >
                          Please list all beneficiaries with their full names,
                          relationship to you (e.g., spouse, child, parent), and
                          the percentage of coverage allocated to each. Ensure
                          the total coverage adds up to 100%.
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
                        <textarea
                          className="form-input"
                          rows={4}
                          required
                          placeholder="Enter your insurance plan details including plan name, policy number, coverage type, and any additional plan information"
                          value={formData.plan_details}
                          onChange={(e) =>
                            change("plan_details", e.target.value)
                          }
                        />
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--gray-600)",
                            marginTop: "8px",
                          }}
                        >
                          Please provide comprehensive information about your
                          insurance plan including the plan name, policy number,
                          type of coverage (e.g., HMO, PPO), deductible amount,
                          and any other relevant plan details.
                        </p>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Why quoted.. Immediate/Graded/ROP
                        </label>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="Specify the quote type: Immediate Death Benefit, Graded Death Benefit, or Return of Premium (ROP)"
                          value={formData.quote_type}
                          onChange={(e) => change("quote_type", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Questionnaire */}
                  <div className="card" style={{ marginBottom: "24px" }}>
                    <div className="card-header">
                      <h3 className="card-title">Health Questionnaire</h3>
                    </div>
                    <div className="card-content">
                      <HealthQuestionnaire
                        formData={formData}
                        onChange={change}
                      />
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
                          Within the past 6 months, have you been hospitalized
                          or diagnosed by a medical professional with ongoing
                          medical complications due to the novel coronavirus
                          (COVID-19) or are you currently diagnosed by a medical
                          professional with or being treated for the novel
                          coronavirus (COVID-19)?
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "24px",
                            marginTop: "8px",
                          }}
                        >
                          {["yes", "no"].map((opt) => (
                            <label
                              key={opt}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="covid_question"
                                value={opt}
                                style={{ width: "18px", height: "18px" }}
                                checked={formData.covid_question === opt}
                                onChange={(e) =>
                                  change("covid_question", e.target.value)
                                }
                              />
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
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "16px",
                        }}
                      >
                        <div className="form-group">
                          <label className="form-label">Name of Bank *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.bank_name}
                            onChange={(e) =>
                              change("bank_name", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Name on Account *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.account_name}
                            onChange={(e) =>
                              change("account_name", e.target.value)
                            }
                          />
                        </div>
                        <div
                          className={`form-group ${errors.account_number ? "error" : ""}`}
                        >
                          <label className="form-label">
                            Account Number{" "}
                            <span className="required-indicator">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Account number"
                            required
                            value={formData.account_number}
                            onChange={(e) =>
                              change(
                                "account_number",
                                maskAccountNumber(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div
                          className={`form-group ${errors.routing_number ? "error" : ""}`}
                        >
                          <label className="form-label">
                            Routing Number{" "}
                            <span className="required-indicator">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="9 digits"
                            maxLength={9}
                            required
                            value={formData.routing_number}
                            onChange={(e) =>
                              change(
                                "routing_number",
                                maskRoutingNumber(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "span 2" }}
                        >
                          <label className="form-label">Account Type *</label>
                          <div
                            style={{
                              display: "flex",
                              gap: "24px",
                              marginTop: "8px",
                            }}
                          >
                            {[
                              { value: "checking", label: "Checking" },
                              { value: "saving", label: "Saving" },
                              {
                                value: "direct_express",
                                label: "Direct Express Card",
                              },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="account_type"
                                  value={opt.value}
                                  required
                                  style={{ width: "18px", height: "18px" }}
                                  checked={formData.account_type === opt.value}
                                  onChange={(e) =>
                                    change("account_type", e.target.value)
                                  }
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "span 2" }}
                        >
                          <label className="form-label">Comments</label>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Enter any additional comments or special instructions regarding your banking information"
                            value={formData.banking_comments}
                            onChange={(e) =>
                              change("banking_comments", e.target.value)
                            }
                          />
                          <p
                            style={{
                              fontSize: "13px",
                              color: "var(--gray-600)",
                              marginTop: "8px",
                            }}
                          >
                            Please provide any additional information or special
                            instructions related to your banking details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Draft Information */}
                  <div className="card" style={{ marginBottom: "24px" }}>
                    <div className="card-header">
                      <h3 className="card-title">Draft Information</h3>
                    </div>
                    <div className="card-content">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "16px",
                        }}
                      >
                        <div className="form-group">
                          <label className="form-label">Initial Draft</label>
                          <textarea
                            className="form-input"
                            rows={4}
                            placeholder="Enter initial draft notes..."
                            value={formData.initial_draft}
                            onChange={(e) =>
                              change("initial_draft", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Future Draft</label>
                          <textarea
                            className="form-input"
                            rows={4}
                            placeholder="Enter future draft notes..."
                            value={formData.future_draft}
                            onChange={(e) =>
                              change("future_draft", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Change Section */}
                  <div
                    className="card"
                    style={{
                      marginBottom: "24px",
                      border: "2px solid #14b8a6",
                      background:
                        "linear-gradient(135deg, rgba(20,184,166,0.05) 0%, rgba(6,182,212,0.05) 100%)",
                      boxShadow: "0 4px 6px rgba(20,184,166,0.1)",
                    }}
                  >
                    <div
                      className="card-header"
                      style={{ borderBottom: "1px solid rgba(20,184,166,0.1)" }}
                    >
                      <h3
                        className="card-title"
                        style={{
                          color: "var(--primary-900)",
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        Change Lead Status
                      </h3>
                    </div>
                    <div className="card-content">
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontWeight: "500", color: "var(--primary-900)" }}
                        >
                          Lead Status
                        </label>
                        <select
                          name="lead_manual_status"
                          className="form-input"
                          value={formData.lead_manual_status}
                          onChange={(e) =>
                            change("lead_manual_status", e.target.value)
                          }
                          style={{
                            borderColor: "#14b8a6",
                            borderWidth: "1px",
                            fontSize: "15px",
                            fontWeight: "500",
                          }}
                        >
                          <option value="">-- Select Status --</option>
                          {/* Conditional Logic for Role ID 4 */}
                          {currentUser?.role_id === 4 ? (
                            <>
                              <option value="approved_level">Approved Level</option>
                              <option value="approved_gi">Approved GI</option>
                            </>
                          ) : (
                            <option value="approved">Approved</option>
                          )}

                          {/* Standard Options */}
                          <option value="rejected">Rejected</option>
                          <option value="dnc">DNC</option>
                        </select>
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            background: "rgba(20,184,166,0.05)",
                            borderLeft: "3px solid #14b8a6",
                            borderRadius: "4px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "13px",
                              color: "var(--primary-900)",
                              margin: 0,
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{ fontSize: "16px", marginTop: "1px" }}
                            >
                              ℹ️
                            </span>
                            <span>
                              Status will be automatically assigned. We can
                              manually change to Approved, or Rejected if
                              needed.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                    }}
                  >
                    <Link href="/leads" className="btn-secondary">
                      Cancel
                    </Link>
                    <button
                      ref={saveButtonRef}
                      type="submit"
                      className="btn-primary"
                      disabled={!hasChanges || isSaving}
                      style={{
                        opacity: hasChanges && !isSaving ? 1 : 0.5,
                        cursor:
                          hasChanges && !isSaving ? "pointer" : "not-allowed",
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Sidebar */}
              <div
                style={{
                  flex: 1,
                  position: "sticky",
                  top: "24px",
                  height: "fit-content",
                }}
              >
                {/* Lead Status Timeline */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div className="card-header">
                    <h3 className="card-title">Lead Status Timeline</h3>
                  </div>
                  <div className="card-content" style={{ padding: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "19px",
                          top: "10px",
                          bottom: "10px",
                          width: "2px",
                          background: "var(--gray-200)",
                        }}
                      />
                      {statuses.map((status, index) => {
                        const isActive = status.id === currentLead?.status;
                        const currentStatusIndex = statuses.findIndex(
                          (s) => s.id === currentLead?.status,
                        );
                        const isPast =
                          currentStatusIndex > -1 && currentStatusIndex > index;

                        const statusColors: Record<
                          number,
                          { bg: string; text: string }
                        > = {
                          1: { bg: "var(--gray-100)", text: "var(--gray-600)" },
                          8: { bg: "var(--secondary-50)", text: "var(--secondary-600)" },
                          3: { bg: "var(--purple-100)", text: "var(--purple-800)" },
                          5: { bg: "var(--primary-100)", text: "var(--primary-900)" },
                          11: { bg: "var(--primary-100)", text: "var(--primary-900)" },
                          4: { bg: "var(--amber-100)", text: "var(--amber-800)" },
                          7: { bg: "var(--rose-100)", text: "var(--rose-800)" },
                          9: { bg: "var(--rose-100)", text: "var(--rose-800)" },
                        };
                        const colors = statusColors[status.id] || {
                          bg: "var(--gray-100)",
                          text: "var(--gray-600)",
                        };

                        return (
                          <div
                            key={status.id}
                            style={{
                              position: "relative",
                              paddingLeft: "50px",
                              paddingBottom:
                                index === statuses.length - 1 ? "0" : "24px",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                left: "10px",
                                top: "0",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                border: `3px solid ${isActive ? "#10b981" : "var(--gray-200)"}`,
                                background: isActive ? "#10b981" : "var(--card-bg)",
                                zIndex: 1,
                              }}
                            />
                            <div>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                }}
                              >
                                {status.status_name}
                              </span>
                              {status.description && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--gray-400)",
                                    marginTop: "4px",
                                  }}
                                >
                                  {status.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Additional Info */}
                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "16px",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <label
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Created By
                        </label>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-primary)",
                            fontWeight: "500",
                          }}
                        >
                          {currentLead.lead_creator_name || "Unassigned"}
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Created
                        </label>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--text-primary)",
                            fontWeight: "500",
                          }}
                        >
                          {currentLead.created_at
                            ? new Date(
                              currentLead.created_at,
                            ).toLocaleDateString()
                            : "N/A"}
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
                    <div
                      style={{
                        marginBottom: "16px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {comments.length === 0 ? (
                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--gray-500)",
                            textAlign: "center",
                            padding: "20px 0",
                          }}
                        >
                          No comments yet
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              marginBottom: "16px",
                              paddingBottom: "16px",
                              borderBottom: "1px solid var(--gray-200)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "var(--primary-500)",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "600",
                                  fontSize: "14px",
                                }}
                              >
                                {comment.user_name?.charAt(0) || "U"}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "var(--gray-900)",
                                  }}
                                >
                                  {comment.user_name || "Unknown User"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--gray-500)",
                                  }}
                                >
                                  {comment.created_at
                                    ? new Date(
                                      comment.created_at,
                                    ).toLocaleString()
                                    : ""}
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "var(--gray-700)",
                                paddingLeft: "40px",
                              }}
                            >
                              {comment.comment}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{ marginBottom: "8px", fontSize: "14px" }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAddComment}
                        disabled={isSubmittingComment || !newComment.trim()}
                        style={{ width: "100%" }}
                      >
                        {isSubmittingComment ? "Adding..." : "Add Comment"}
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
