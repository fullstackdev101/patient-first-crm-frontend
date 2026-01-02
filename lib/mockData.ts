// Mock Data Layer - Updated to match static HTML structure exactly
// This file will be replaced with API calls using axios in production

export type LeadStatus = 'Entry' | 'Manager Review' | 'QA Review' | 'Approved' | 'Pending' | 'Rejected';
export type UserRole = 'Admin' | 'Manager' | 'Sales' | 'QA' | 'Reviewer' | 'Agent';

export interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    middle_initial?: string;
    date_of_birth: string; // Date of birth
    phone: string;
    email: string;
    address: string;
    state_of_birth: string;
    ssn: string;
    status: LeadStatus;
    assigned_to?: string;
    created_at: string;

    // Medical Information
    height?: string;
    weight?: string;
    insurance_provider?: string;
    policy_number?: string;
    medical_notes?: string;

    // Doctor Information
    doctor_name?: string;
    doctor_phone?: string;
    doctor_address?: string;

    // Beneficiary & Plan
    beneficiary_details?: string;
    plan_details?: string;

    // Health Questionnaire
    health_q1?: boolean;
    health_q2?: boolean;
    health_q3?: boolean;
    health_q4?: boolean;
    health_q5?: boolean;
    health_q6?: boolean;
    health_q7a?: boolean;
    health_q7b?: boolean;
    health_q7c?: boolean;
    health_q7d?: boolean;
    health_q8a?: boolean;
    health_q8b?: boolean;
    health_q8c?: boolean;
    health_comments?: string;
    covid_question?: boolean;

    // Banking
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
    account_type?: 'checking' | 'saving' | 'direct_express';
    banking_comments?: string;
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    avatarUrl: string;
}

export interface Comment {
    id: string;
    leadId: string;
    userId: string;
    content: string;
    timestamp: string;
}

export interface StatusHistory {
    id: string;
    leadId: string;
    status: LeadStatus;
    changedBy: string; // User ID
    timestamp: string;
    reason?: string; // For approvals/rejections
}

// Users Data (10 users)
export const mockUsers: User[] = [
    { id: 'U001', name: 'John Smith', role: 'Admin', email: 'john.smith@patientfirst.com', avatarUrl: 'JS' },
    { id: 'U002', name: 'David Wilson', role: 'Sales', email: 'david.wilson@patientfirst.com', avatarUrl: 'DW' },
    { id: 'U003', name: 'Emily Davis', role: 'Manager', email: 'emily.davis@patientfirst.com', avatarUrl: 'ED' },
    { id: 'U004', name: 'Michael Chen', role: 'Sales', email: 'michael.chen@patientfirst.com', avatarUrl: 'MC' },
    { id: 'U005', name: 'Lisa Anderson', role: 'Sales', email: 'lisa.anderson@patientfirst.com', avatarUrl: 'LA' },
    { id: 'U006', name: 'Jennifer Martinez', role: 'Manager', email: 'jennifer.martinez@patientfirst.com', avatarUrl: 'JM' },
    { id: 'U007', name: 'Robert Taylor', role: 'Sales', email: 'robert.taylor@patientfirst.com', avatarUrl: 'RT' },
    { id: 'U008', name: 'Sarah Johnson', role: 'Sales', email: 'sarah.johnson@patientfirst.com', avatarUrl: 'SJ' },
    { id: 'U009', name: 'James Brown', role: 'Admin', email: 'james.brown@patientfirst.com', avatarUrl: 'JB' },
    { id: 'U010', name: 'Patricia White', role: 'Sales', email: 'patricia.white@patientfirst.com', avatarUrl: 'PW' },
];

// Leads Data (matching static HTML structure)
export const mockLeads: Lead[] = [
    {
        id: 'L001',
        first_name: 'John',
        last_name: 'Anderson',
        date_of_birth: '1965-03-15',
        phone: '(555) 123-4567',
        email: 'john.anderson@email.com',
        address: '123 Main St, Springfield, IL 62701',
        state_of_birth: 'Illinois',
        ssn: '123-45-6789',
        status: 'Approved',
        assigned_to: 'David Wilson',
        created_at: '2024-12-01',
    },
    {
        id: 'L002',
        first_name: 'Sarah',
        last_name: 'Williams',
        date_of_birth: '1978-07-22',
        phone: '(555) 234-5678',
        email: 'sarah.williams@email.com',
        address: '456 Oak Ave, Chicago, IL 60601',
        state_of_birth: 'Illinois',
        ssn: '234-56-7890',
        status: 'Pending',
        assigned_to: 'Emily Davis',
        created_at: '2024-12-02',
    },
    {
        id: 'L003',
        first_name: 'Michael',
        last_name: 'Brown',
        date_of_birth: '1982-11-08',
        phone: '(555) 345-6789',
        email: 'michael.brown@email.com',
        address: '789 Elm St, Peoria, IL 61602',
        state_of_birth: 'Illinois',
        ssn: '345-67-8901',
        status: 'Manager Review',
        assigned_to: 'Michael Chen',
        created_at: '2024-12-03',
    },
    {
        id: 'L004',
        first_name: 'Emily',
        last_name: 'Johnson',
        date_of_birth: '1990-05-30',
        phone: '(555) 456-7890',
        email: 'emily.johnson@email.com',
        address: '321 Pine Rd, Rockford, IL 61101',
        state_of_birth: 'Illinois',
        ssn: '456-78-9012',
        status: 'QA Review',
        assigned_to: 'Lisa Anderson',
        created_at: '2024-12-04',
    },
    {
        id: 'L005',
        first_name: 'Robert',
        last_name: 'Davis',
        date_of_birth: '1975-09-12',
        phone: '(555) 567-8901',
        email: 'robert.davis@email.com',
        address: '654 Maple Dr, Aurora, IL 60505',
        state_of_birth: 'Illinois',
        ssn: '567-89-0123',
        status: 'Rejected',
        assigned_to: 'Jennifer Martinez',
        created_at: '2024-12-05',
    },
    {
        id: 'L006',
        first_name: 'Jennifer',
        last_name: 'Martinez',
        date_of_birth: '1988-02-18',
        phone: '(555) 678-9012',
        email: 'jennifer.martinez@email.com',
        address: '987 Cedar Ln, Naperville, IL 60540',
        state_of_birth: 'Illinois',
        ssn: '678-90-1234',
        status: 'Entry',
        assigned_to: 'David Wilson',
        created_at: '2024-12-06',
    },
    {
        id: 'L007',
        first_name: 'David',
        last_name: 'Wilson',
        date_of_birth: '1970-06-25',
        phone: '(555) 789-0123',
        email: 'david.wilson@email.com',
        address: '147 Birch St, Joliet, IL 60432',
        state_of_birth: 'Illinois',
        ssn: '789-01-2345',
        status: 'QA Review',
        assigned_to: 'Emily Davis',
        created_at: '2024-12-07',
    },
    {
        id: 'L008',
        first_name: 'Lisa',
        last_name: 'Anderson',
        date_of_birth: '1985-10-03',
        phone: '(555) 890-1234',
        email: 'lisa.anderson@email.com',
        address: '258 Spruce Ave, Elgin, IL 60120',
        state_of_birth: 'Illinois',
        ssn: '890-12-3456',
        status: 'Approved',
        assigned_to: 'Michael Chen',
        created_at: '2024-12-08',
    },
    {
        id: 'L009',
        first_name: 'Thomas',
        last_name: 'Garcia',
        date_of_birth: '1992-04-14',
        phone: '(555) 901-2345',
        email: 'thomas.garcia@email.com',
        address: '369 Walnut Ct, Waukegan, IL 60085',
        state_of_birth: 'Illinois',
        ssn: '901-23-4567',
        status: 'Entry',
        assigned_to: 'Lisa Anderson',
        created_at: '2024-12-09',
    },
    {
        id: 'L010',
        first_name: 'Barbara',
        last_name: 'Taylor',
        date_of_birth: '1968-12-07',
        phone: '(555) 012-3456',
        email: 'barbara.taylor@email.com',
        address: '741 Ash Blvd, Cicero, IL 60804',
        state_of_birth: 'Illinois',
        ssn: '012-34-5678',
        status: 'Manager Review',
        assigned_to: 'David Wilson',
        created_at: '2024-12-10',
    },
    {
        id: 'L011',
        first_name: 'Christopher',
        last_name: 'Lee',
        date_of_birth: '1980-08-19',
        phone: '(555) 123-7890',
        email: 'chris.lee@email.com',
        address: '852 Hickory Pl, Schaumburg, IL 60173',
        state_of_birth: 'Illinois',
        ssn: '123-45-7890',
        status: 'Approved',
        assigned_to: 'Emily Davis',
        created_at: '2024-12-11',
    },
    {
        id: 'L012',
        first_name: 'Nancy',
        last_name: 'White',
        date_of_birth: '1973-01-28',
        phone: '(555) 234-8901',
        email: 'nancy.white@email.com',
        address: '963 Willow Way, Evanston, IL 60201',
        state_of_birth: 'Illinois',
        ssn: '234-56-8901',
        status: 'QA Review',
        assigned_to: 'Michael Chen',
        created_at: '2024-12-12',
    },
    {
        id: 'L013',
        first_name: 'Daniel',
        last_name: 'Harris',
        date_of_birth: '1995-11-11',
        phone: '(555) 345-9012',
        email: 'daniel.h@email.com',
        address: '159 Poplar Rd, Skokie, IL 60076',
        state_of_birth: 'Illinois',
        ssn: '345-67-9012',
        status: 'Entry',
        assigned_to: 'Lisa Anderson',
        created_at: '2024-12-13',
    },
    {
        id: 'L014',
        first_name: 'Karen',
        last_name: 'Martin',
        date_of_birth: '1987-03-05',
        phone: '(555) 456-0123',
        email: 'karen.martin@email.com',
        address: '357 Chestnut Dr, Des Plaines, IL 60016',
        state_of_birth: 'Illinois',
        ssn: '456-78-0123',
        status: 'Pending',
        assigned_to: 'Jennifer Martinez',
        created_at: '2024-12-14',
    },
    {
        id: 'L015',
        first_name: 'Paul',
        last_name: 'Thompson',
        date_of_birth: '1976-09-23',
        phone: '(555) 567-1234',
        email: 'paul.t@email.com',
        address: '468 Beech St, Oak Park, IL 60302',
        state_of_birth: 'Illinois',
        ssn: '567-89-1234',
        status: 'Approved',
        assigned_to: 'David Wilson',
        created_at: '2024-12-15',
    },
];

// Comments Data
export const mockComments: Comment[] = [
    {
        id: 'C001',
        leadId: 'L001',
        userId: 'U002',
        content: 'Initial contact made via phone. Customer expressed interest in Medicare Advantage plans with dental coverage.',
        timestamp: '2024-12-01T10:45:00Z',
    },
    {
        id: 'C002',
        leadId: 'L001',
        userId: 'U003',
        content: 'Sent detailed plan comparison via email. Highlighted Plan A and Plan B options based on customer needs.',
        timestamp: '2024-12-01T14:30:00Z',
    },
    {
        id: 'C003',
        leadId: 'L001',
        userId: 'U002',
        content: 'Follow-up call scheduled for tomorrow at 2 PM. Customer wants to review with spouse before deciding.',
        timestamp: '2024-12-01T16:20:00Z',
    },
    {
        id: 'C004',
        leadId: 'L001',
        userId: 'U003',
        content: 'Manager review: This lead looks promising. Ensure we emphasize the dental benefits as that seems to be the key decision factor.',
        timestamp: '2024-12-02T09:15:00Z',
    },
    {
        id: 'C005',
        leadId: 'L002',
        userId: 'U004',
        content: 'Referral from existing customer. Initial contact made, customer has questions about prescription drug coverage.',
        timestamp: '2024-12-02T14:35:00Z',
    },
    {
        id: 'C006',
        leadId: 'L002',
        userId: 'U004',
        content: 'Provided detailed information about Part D plans. Customer is currently taking 5 medications and wants to ensure they are all covered.',
        timestamp: '2024-12-02T15:50:00Z',
    },
    {
        id: 'C007',
        leadId: 'L002',
        userId: 'U006',
        content: 'Sent personalized drug coverage analysis. All 5 medications are covered under Plan C with minimal copay.',
        timestamp: '2024-12-03T10:20:00Z',
    },
    {
        id: 'C008',
        leadId: 'L002',
        userId: 'U004',
        content: 'Customer very satisfied with the analysis. Requested enrollment paperwork. Moving to qualified status.',
        timestamp: '2024-12-04T11:40:00Z',
    },
];

// Status History Data
export const mockStatusHistory: StatusHistory[] = [
    // L001 - Approved Lead
    {
        id: 'SH001',
        leadId: 'L001',
        status: 'Entry',
        changedBy: 'U002', // David Wilson (Sales)
        timestamp: '2024-12-01T09:00:00Z',
        reason: 'New lead created from website inquiry'
    },
    {
        id: 'SH002',
        leadId: 'L001',
        status: 'Manager Review',
        changedBy: 'U002', // David Wilson (Sales)
        timestamp: '2024-12-01T15:30:00Z',
        reason: 'Initial contact completed, customer interested in Medicare Advantage'
    },
    {
        id: 'SH003',
        leadId: 'L001',
        status: 'QA Review',
        changedBy: 'U003', // Emily Davis (Manager)
        timestamp: '2024-12-02T10:15:00Z',
        reason: 'Manager approved - all documentation complete'
    },
    {
        id: 'SH004',
        leadId: 'L001',
        status: 'Approved',
        changedBy: 'U009', // James Brown (Admin)
        timestamp: '2024-12-02T14:45:00Z',
        reason: 'QA passed - customer enrolled in Plan A with dental coverage'
    },
    // L002 - Pending Lead
    {
        id: 'SH005',
        leadId: 'L002',
        status: 'Entry',
        changedBy: 'U004', // Michael Chen (Sales)
        timestamp: '2024-12-02T11:20:00Z',
        reason: 'Referral from existing customer'
    },
    {
        id: 'SH006',
        leadId: 'L002',
        status: 'Manager Review',
        changedBy: 'U004', // Michael Chen (Sales)
        timestamp: '2024-12-03T16:00:00Z',
        reason: 'Customer interested in Part D prescription coverage'
    },
    {
        id: 'SH007',
        leadId: 'L002',
        status: 'Pending',
        changedBy: 'U006', // Jennifer Martinez (Manager)
        timestamp: '2024-12-04T13:30:00Z',
        reason: 'Waiting for customer to provide current medication list'
    },
    // L005 - Rejected Lead
    {
        id: 'SH008',
        leadId: 'L005',
        status: 'Entry',
        changedBy: 'U007', // Robert Taylor (Sales)
        timestamp: '2024-12-05T08:45:00Z',
        reason: 'Cold call lead'
    },
    {
        id: 'SH009',
        leadId: 'L005',
        status: 'Manager Review',
        changedBy: 'U007', // Robert Taylor (Sales)
        timestamp: '2024-12-05T14:20:00Z',
        reason: 'Initial contact made, customer requested information'
    },
    {
        id: 'SH010',
        leadId: 'L005',
        status: 'Rejected',
        changedBy: 'U006', // Jennifer Martinez (Manager)
        timestamp: '2024-12-06T09:00:00Z',
        reason: 'Customer does not meet eligibility requirements - under 65 and not disabled'
    },
];

// Helper functions
export const getLeadById = (id: string): Lead | undefined => {
    return mockLeads.find(lead => lead.id === id);
};

export const getCommentsByLeadId = (leadId: string): Comment[] => {
    return mockComments.filter(comment => comment.leadId === leadId);
};

export const getUserById = (id: string): User | undefined => {
    return mockUsers.find(user => user.id === id);
};

export const searchLeads = (query: string): Lead[] => {
    const lowerQuery = query.toLowerCase();
    return mockLeads.filter(lead =>
        lead.id.toLowerCase().includes(lowerQuery) ||
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(lowerQuery) ||
        lead.email.toLowerCase().includes(lowerQuery) ||
        lead.phone.includes(query)
    );
};

export const filterLeadsByStatus = (status: LeadStatus | 'All Statuses'): Lead[] => {
    if (status === 'All Statuses') return mockLeads;
    return mockLeads.filter(lead => lead.status === status);
};

export const getStatusHistoryByLeadId = (leadId: string): StatusHistory[] => {
    return mockStatusHistory.filter(history => history.leadId === leadId).sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};
