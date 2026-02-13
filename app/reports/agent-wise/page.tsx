'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from '@/lib/axios';

// Type definition for agent report data
interface AgentReportData {
    agentName: string;
    totalLeads: number;
    approved: number;
    rejected: number;
    other: number;
    conversionRate: string;
}

export default function AgentWiseReport() {
    const [reportData, setReportData] = useState<AgentReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/reports/agent-wise');

            if (response.data.success) {
                setReportData(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch report data');
            }
        } catch (err: any) {
            console.error('Error fetching agent-wise report:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log out and log back in.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to load report data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = reportData.reduce((acc, row) => ({
        totalLeads: acc.totalLeads + row.totalLeads,
        approved: acc.approved + row.approved,
        rejected: acc.rejected + row.rejected,
        other: acc.other + row.other
    }), { totalLeads: 0, approved: 0, rejected: 0, other: 0 });

    const overallConversion = totals.totalLeads > 0
        ? ((totals.approved / totals.totalLeads) * 100).toFixed(1)
        : '0.0';

    const getStatusBadgeClass = (type: string) => {
        switch (type) {
            case 'approved':
                return 'badge-success';
            case 'rejected':
                return 'badge-danger';
            case 'other':
                return 'badge-warning';
            default:
                return 'badge-default';
        }
    };

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header" style={{ marginBottom: '24px' }}>
                            <div>
                                <h2 className="page-title">Agent-wise Report</h2>
                                <p className="page-subtitle">Performance Overview by Agent</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                                <p>Loading report data...</p>
                            </div>
                        ) : error ? (
                            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--danger-600)' }}>
                                <p>{error}</p>
                                <button
                                    onClick={fetchReportData}
                                    style={{
                                        marginTop: '16px',
                                        padding: '8px 16px',
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="metrics-grid" style={{ marginBottom: '24px' }}>
                                    <div className="card" style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>Total Leads</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gray-900)' }}>
                                            {totals.totalLeads.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>All Agents</div>
                                    </div>

                                    <div className="card" style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>Approved</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success-600)' }}>
                                            {totals.approved.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                            {overallConversion}% Conversion
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>Rejected</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger-600)' }}>
                                            {totals.rejected.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                            {totals.totalLeads > 0 ? ((totals.rejected / totals.totalLeads) * 100).toFixed(1) : '0.0'}%
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>Other</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning-600)' }}>
                                            {totals.other.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                            {totals.totalLeads > 0 ? ((totals.other / totals.totalLeads) * 100).toFixed(1) : '0.0'}%
                                        </div>
                                    </div>
                                </div>

                                {/* Data Table */}
                                <div className="card">
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Agent Name</th>
                                                    <th>Total Leads</th>
                                                    <th>Approved</th>
                                                    <th>Rejected</th>
                                                    <th>Other</th>
                                                    <th>Conversion Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                                                            No agent data available
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    reportData.map((row, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                                                                    {row.agentName}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                                                                    {row.totalLeads}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${getStatusBadgeClass('approved')}`} style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {row.approved}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${getStatusBadgeClass('rejected')}`} style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {row.rejected}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${getStatusBadgeClass('other')}`} style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {row.other}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-600)' }}>
                                                                    {row.conversionRate}%
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                            {reportData.length > 0 && (
                                                <tfoot>
                                                    <tr style={{
                                                        background: 'var(--gray-50)',
                                                        fontWeight: '700',
                                                        borderTop: '2px solid var(--gray-300)'
                                                    }}>
                                                        <td><strong>TOTAL</strong></td>
                                                        <td><strong>{totals.totalLeads}</strong></td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass('approved')}`} style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {totals.approved}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass('rejected')}`} style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {totals.rejected}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass('other')}`} style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {totals.other}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: 'var(--primary-600)' }}>
                                                                {overallConversion}%
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
