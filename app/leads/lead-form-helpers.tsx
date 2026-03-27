"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormData = {
    first_name: string;
    last_name: string;
    middle_initial: string;
    date_of_birth?: string;
    dob_month: string;
    dob_day: string;
    dob_year: string;
    phone: string;
    email: string;
    address: string;
    apt_lot: string;
    city: string;
    state: string;
    zipcode: string;
    state_of_birth: string;
    ssn: string;
    height: string;
    weight: string;
    insurance_provider: string;
    policy_number: string;
    medical_notes: string;
    doctor_name: string;
    doctor_phone: string;
    doctor_address: string;
    beneficiary_details: string;
    plan_details: string;
    quote_type: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    routing_number: string;
    account_type: "checking" | "saving";
    banking_comments: string;
    initial_draft: string;
    future_draft: string;
    hospitalized_nursing_oxygen_cancer_assistance: string;
    organ_transplant_terminal_condition: string;
    aids_hiv_immune_deficiency: string;
    diabetes_complications_insulin: string;
    kidney_disease_multiple_cancers: string;
    pending_tests_surgery_hospitalization: string;
    angina_stroke_lupus_copd_hepatitis: string;
    heart_attack_aneurysm_surgery: string;
    cancer_treatment_2years: string;
    substance_abuse_treatment: string;
    cardiovascular_events_3years: string;
    cancer_respiratory_liver_3years: string;
    neurological_conditions_3years: string;
    health_comments: string;
    covid_question: string;
    [key: string]: any;
};

export const INITIAL_FORM_DATA: FormData = {
    first_name: "",
    last_name: "",
    middle_initial: "",
    dob_month: "",
    dob_day: "",
    dob_year: "",
    phone: "",
    email: "",
    address: "",
    apt_lot: "",
    city: "",
    state: "",
    zipcode: "",
    state_of_birth: "",
    ssn: "",
    height: "",
    weight: "",
    insurance_provider: "",
    policy_number: "",
    medical_notes: "",
    doctor_name: "",
    doctor_phone: "",
    doctor_address: "",
    beneficiary_details: "",
    plan_details: "",
    quote_type: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    routing_number: "",
    account_type: "checking",
    banking_comments: "",
    initial_draft: "",
    future_draft: "",
    hospitalized_nursing_oxygen_cancer_assistance: "no",
    organ_transplant_terminal_condition: "no",
    aids_hiv_immune_deficiency: "no",
    diabetes_complications_insulin: "no",
    kidney_disease_multiple_cancers: "no",
    pending_tests_surgery_hospitalization: "no",
    angina_stroke_lupus_copd_hepatitis: "no",
    heart_attack_aneurysm_surgery: "no",
    cancer_treatment_2years: "no",
    substance_abuse_treatment: "no",
    cardiovascular_events_3years: "no",
    cancer_respiratory_liver_3years: "no",
    neurological_conditions_3years: "no",
    health_comments: "",
    covid_question: "no",
};

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Generic change handler factory — replaces all inline `setFormData({...formData, field: value})` calls */
export function handleChange<T extends Record<string, any>>(
    setFormData: React.Dispatch<React.SetStateAction<T>>
) {
    return (field: keyof T, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
}

/** Parse a YYYY-MM-DD date string into separate year/month/day parts */
export function parseDOB(dateStr: string) {
    if (!dateStr) return { dob_year: "", dob_month: "", dob_day: "" };
    const [y, m, d] = dateStr.split("-");
    return { dob_year: y || "", dob_month: m || "", dob_day: d || "" };
}

/**
 * Fields that are intentionally numeric (bank account, routing, SSN) and are
 * handled separately via input masking + backend encryption. They must NOT be
 * flagged as credit-card data even though they contain long digit sequences.
 */
const SKIP_CARD_CHECK_FIELDS = new Set([
    "account_number",
    "routing_number",
    "ssn",
]);

/** 
 * Checks a string for patterns that look like sensitive credit card information.
 * Returns a message describing the finding, or null if clean.
 */
export function validateSensitiveSecrets(data: any, fieldKey?: string): string | null {
    if (!data) return null;
    
    // If it's an object (like FormData), check all string values
    if (typeof data === 'object') {
        for (const key in data) {
            const finding = validateSensitiveSecrets(data[key], key);
            if (finding) return finding;
        }
        return null;
    }

    if (typeof data !== 'string') return null;

    // 1. Card Number: 13-19 digits, possibly with spaces or dashes
    // Skip known legitimate numeric fields (bank account, routing, SSN) — these
    // are intentionally digit-heavy and are encrypted on the backend.
    if (!fieldKey || !SKIP_CARD_CHECK_FIELDS.has(fieldKey)) {
        const cardPattern = /\b(?:\d[ -]*?){13,19}\b/;
        if (cardPattern.test(data)) {
            const digitsOnly = data.replace(/\D/g, "");
            if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
                return "Potential Credit Card Number detected. For security reasons, do not enter full card numbers.";
            }
        }
    }

    // 2. CVV: 3 or 4 digits near keywords
    const cvvPattern = /\b(?:cvv|cvc|security\s*code|sec\s*code|verification\s*value)\b.*?\b\d{3,4}\b/i;
    if (cvvPattern.test(data)) {
        return "Potential CVV/CVC security code detected. This information must not be stored.";
    }

    // 3. Expiry Date: MM/YY or MM/YYYY
    const expiryPattern = /\b(0[1-9]|1[0-2])[\/\-](?:\d{2}|\d{4})\b/;
    if (expiryPattern.test(data)) {
        // Check if it's near payment keywords to be more precise, but user asked for general prevention
        const paymentKeywords = /exp|expiry|valid\s*thru|date/i;
        if (paymentKeywords.test(data)) {
            return "Potential Credit Card Expiry Date detected. This information is sensitive.";
        }
    }

    return null;
}

/** Health questionnaire field names */
export const HEALTH_FIELD_NAMES = [
    "hospitalized_nursing_oxygen_cancer_assistance",
    "organ_transplant_terminal_condition",
    "aids_hiv_immune_deficiency",
    "diabetes_complications_insulin",
    "kidney_disease_multiple_cancers",
    "pending_tests_surgery_hospitalization",
    "angina_stroke_lupus_copd_hepatitis",
    "heart_attack_aneurysm_surgery",
    "cancer_treatment_2years",
    "substance_abuse_treatment",
    "cardiovascular_events_3years",
    "cancer_respiratory_liver_3years",
    "neurological_conditions_3years",
    "covid_question",
] as const;

// ─── Shared Components ────────────────────────────────────────────────────────

interface HealthQuestionProps {
    fieldName: string;
    label: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    indent?: boolean;
}

/** Renders a Yes/No radio group for health questionnaire items */
export function HealthQuestion({
    fieldName,
    label,
    value,
    onChange,
    indent = false,
}: HealthQuestionProps) {
    return (
        <div className="form-group" style={indent ? { paddingLeft: "16px" } : undefined}>
            <label className="form-label">{label}</label>
            <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                {["yes", "no"].map((opt) => (
                    <label
                        key={opt}
                        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                    >
                        <input
                            type="radio"
                            name={fieldName}
                            value={opt}
                            style={{ width: "18px", height: "18px" }}
                            checked={value === opt}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        <span>{opt === "yes" ? "Yes" : "No"}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

interface DOBSelectsProps {
    month: string;
    day: string;
    year: string;
    onMonthChange: (val: string) => void;
    onDayChange: (val: string) => void;
    onYearChange: (val: string) => void;
}

/** Renders the Month / Day / Year dropdown set for Date of Birth */
export function DOBSelects({
    month,
    day,
    year,
    onMonthChange,
    onDayChange,
    onYearChange,
}: DOBSelectsProps) {
    return (
        <div style={{ display: "flex", gap: "8px" }}>
            <select
                className="form-input"
                required
                value={month || ""}
                onChange={(e) => onMonthChange(e.target.value)}
                style={{ width: "120px" }}
            >
                <option value="">MM</option>
                {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                        {String(i + 1).padStart(2, "0")}
                    </option>
                ))}
            </select>

            <select
                className="form-input"
                required
                value={day || ""}
                onChange={(e) => onDayChange(e.target.value)}
                style={{ width: "120px" }}
            >
                <option value="">DD</option>
                {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                        {i + 1}
                    </option>
                ))}
            </select>

            <select
                className="form-input"
                required
                value={year || ""}
                onChange={(e) => onYearChange(e.target.value)}
                style={{ width: "130px" }}
            >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

/** Renders the full Health Questionnaire card body */
interface HealthQuestionnaireProps {
    formData: FormData;
    onChange: (field: string, val: string) => void;
}

export function HealthQuestionnaire({ formData, onChange }: HealthQuestionnaireProps) {
    return (
        <>
            {/* Question 1 */}
            <HealthQuestion
                fieldName="hospitalized_nursing_oxygen_cancer_assistance"
                value={formData.hospitalized_nursing_oxygen_cancer_assistance}
                onChange={(v) => onChange("hospitalized_nursing_oxygen_cancer_assistance", v)}
                label="1. Are you currently hospitalized, confined to a nursing facility, a bed, or a wheelchair due to chronic illness or disease, currently using oxygen equipment to assist in breathing, receiving Hospice Care or home health care, or had an amputation caused by disease, or do you currently have any form of cancer (excluding basal cell skin cancer) diagnosed or treated by a medical professional, or do you require assistance (from anyone) with activities of daily living such as bathing, dressing, eating or toileting?"
            />

            {/* Question 2 */}
            <HealthQuestion
                fieldName="organ_transplant_terminal_condition"
                value={formData.organ_transplant_terminal_condition}
                onChange={(v) => onChange("organ_transplant_terminal_condition", v)}
                label="2. Have you had or been medically advised to have an organ transplant or kidney dialysis, or have you been medically diagnosed as having congestive heart failure (CHF), Alzheimer's, dementia, mental incapacity, Lou Gehrig's disease (ALS), liver failure, respiratory failure, or been diagnosed by a medical professional as having a terminal medical condition or end-stage disease that is expected to result in death in the next 12 months?"
            />

            {/* Question 3 */}
            <HealthQuestion
                fieldName="aids_hiv_immune_deficiency"
                value={formData.aids_hiv_immune_deficiency}
                onChange={(v) => onChange("aids_hiv_immune_deficiency", v)}
                label="3. Have you been medically treated or diagnosed by a medical professional as having Acquired Immune Deficiency Syndrome (AIDS), AIDS related complex (ARC), or any immune deficiency related disorder or tested positive for the Human Immunodeficiency Virus (HIV)?"
            />

            <div style={{ padding: "12px", background: "var(--rose-100)", border: "1px solid var(--rose-500)", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--rose-800)", fontWeight: "600" }}>
                    If any answer to questions 1 through 3 is answered &quot;Yes&quot; the Proposed Insured is not eligible for any coverage.
                </p>
            </div>

            {/* Question 4 */}
            <HealthQuestion
                fieldName="diabetes_complications_insulin"
                value={formData.diabetes_complications_insulin}
                onChange={(v) => onChange("diabetes_complications_insulin", v)}
                label="4. Have you ever been medically diagnosed or treated for complications of diabetes, including insulin shock, diabetic coma, retinopathy (eye), nephropathy (kidney), neuropathy (nerve damage/pain), or used insulin prior to age 50?"
            />

            {/* Question 5 */}
            <HealthQuestion
                fieldName="kidney_disease_multiple_cancers"
                value={formData.kidney_disease_multiple_cancers}
                onChange={(v) => onChange("kidney_disease_multiple_cancers", v)}
                label="5. Have you ever been medically diagnosed, treated or taken medication for renal insufficiency, kidney failure, chronic kidney disease, or more than one occurrence of cancer in your lifetime (excluding basal cell skin cancer)?"
            />

            {/* Question 6 */}
            <HealthQuestion
                fieldName="pending_tests_surgery_hospitalization"
                value={formData.pending_tests_surgery_hospitalization}
                onChange={(v) => onChange("pending_tests_surgery_hospitalization", v)}
                label="6. Within the past 2 years have you had any diagnostic testing (excluding tests related to Human Immunodeficiency Virus (HIV)), surgery, or hospitalization advised by a medical professional which has not been completed or for which the results have not been received?"
            />

            {/* Question 7 */}
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: "12px" }}>
                    7. Within the past 2 years have you:
                </label>
                <HealthQuestion
                    fieldName="angina_stroke_lupus_copd_hepatitis"
                    value={formData.angina_stroke_lupus_copd_hepatitis}
                    onChange={(v) => onChange("angina_stroke_lupus_copd_hepatitis", v)}
                    indent
                    label="a. been medically diagnosed or treated for angina (chest pain), stroke or TIA, cardiomyopathy, systemic lupus (SLE), cirrhosis, Hepatitis C, chronic hepatitis, chronic pancreatitis, chronic obstructive pulmonary disease (COPD), emphysema, chronic bronchitis, or required oxygen equipment to assist in breathing?"
                />
                <HealthQuestion
                    fieldName="heart_attack_aneurysm_surgery"
                    value={formData.heart_attack_aneurysm_surgery}
                    onChange={(v) => onChange("heart_attack_aneurysm_surgery", v)}
                    indent
                    label="b. had a heart attack or aneurysm, or had or been medically advised to have any type of heart, brain or circulatory surgery (including, but not limited to a pacemaker insertion, defibrillator placement), or any procedure to improve circulation?"
                />
                <HealthQuestion
                    fieldName="cancer_treatment_2years"
                    value={formData.cancer_treatment_2years}
                    onChange={(v) => onChange("cancer_treatment_2years", v)}
                    indent
                    label="c. been medically diagnosed, or treated, or taken medication for any form of cancer (excluding basal cell skin cancer)?"
                />
                <HealthQuestion
                    fieldName="substance_abuse_treatment"
                    value={formData.substance_abuse_treatment}
                    onChange={(v) => onChange("substance_abuse_treatment", v)}
                    indent
                    label="d. used illegal drugs, abused alcohol or drugs, had or been recommended by a medical professional to have treatment or counseling for alcohol or drug use or been advised to discontinue use of alcohol or drugs?"
                />
            </div>

            <div style={{ padding: "12px", background: "var(--amber-100)", border: "1px solid var(--amber-500)", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--amber-800)", fontWeight: "600" }}>
                    If any answer to questions 4 through 7 is answered &quot;Yes&quot; the Proposed Insured should apply for the Return of Premium Death Benefit Plan.
                </p>
            </div>

            {/* Question 8 */}
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: "12px" }}>
                    8. Within the past 3 years have you been medically diagnosed or treated, or hospitalized for:
                </label>
                <HealthQuestion
                    fieldName="cardiovascular_events_3years"
                    value={formData.cardiovascular_events_3years}
                    onChange={(v) => onChange("cardiovascular_events_3years", v)}
                    indent
                    label="a. stroke, angina (chest pain), heart attack, aneurysm, heart or circulatory surgery or any procedure to improve circulation?"
                />
                <HealthQuestion
                    fieldName="cancer_respiratory_liver_3years"
                    value={formData.cancer_respiratory_liver_3years}
                    onChange={(v) => onChange("cancer_respiratory_liver_3years", v)}
                    indent
                    label="b. or taken medication for any form of cancer (excluding basal cell skin cancer), emphysema, chronic bronchitis, chronic obstructive pulmonary disease (COPD), ulcerative colitis, cirrhosis, Hepatitis C, or liver disease?"
                />
                <HealthQuestion
                    fieldName="neurological_conditions_3years"
                    value={formData.neurological_conditions_3years}
                    onChange={(v) => onChange("neurological_conditions_3years", v)}
                    indent
                    label="c. paralysis of two or more extremities or cerebral palsy, multiple sclerosis, seizures, Parkinson's disease or muscular dystrophy?"
                />
            </div>

            <div style={{ padding: "12px", background: "var(--secondary-50)", border: "1px solid var(--secondary-500)", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--secondary-600)", fontWeight: "600" }}>
                    If any answer to question 8 is answered &quot;Yes&quot; the Proposed Insured should apply for the Graded Death Benefit Plan.
                </p>
            </div>

            <div style={{ padding: "12px", background: "var(--primary-50)", border: "1px solid var(--primary-500)", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--primary-600)", fontWeight: "600" }}>
                    If all questions 1 through 8 are answered &quot;No&quot; the Proposed Insured should apply for the Immediate Death Benefit Plan.
                </p>
            </div>

            <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter any additional health-related comments"
                    value={formData.health_comments}
                    onChange={(e) => onChange("health_comments", e.target.value)}
                />
            </div>
        </>
    );
}
