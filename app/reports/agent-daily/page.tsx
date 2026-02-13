'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import '../reports.css';

// Type definition for agent daily data
interface AgentDailyData {
    date: string;
    agent: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    conversion: string;
}

// Dummy data for Agent-wise Daily Report (last 10 days)
const generateAgentDailyData = (): AgentDailyData[] => {
    const agents = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson'];
    const data: AgentDailyData[] = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        agents.forEach(agent => {
            const total = Math.floor(Math.random() * 30) + 30; // 30-60 leads
            const approved = Math.floor(total * (Math.random() * 0.2 + 0.3)); // 30-50% approved
            const rejected = Math.floor(total * (Math.random() * 0.1 + 0.1)); // 10-20% rejected
            const pending = total - approved - rejected;

            data.push({
                date: dateStr,
                agent,
                total,
                approved,
                rejected,
                pending,
                conversion: ((approved / total) * 100).toFixed(1)
            });
        });
    }

    return data.sort((a, b) => b.date.localeCompare(a.date));
};

export default function AgentDailyReport() {
    const [data] = useState<AgentDailyData[]>(generateAgentDailyData());

    // Calculate totals
    const totals = data.reduce((acc, row) => ({
        total: acc.total + row.total,
        approved: acc.approved + row.approved,
        rejected: acc.rejected + row.rejected,
        pending: acc.pending + row.pending
    }), { total: 0, approved: 0, rejected: 0, pending: 0 });

    const totalConversion = ((totals.approved / totals.total) * 100).toFixed(1);

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="reports-container">
                            <div className="reports-header">
                                <h1>Agent-wise Daily Report</h1>
                                <p className="reports-subtitle">Last 10 Days Performance</p>
                            </div>

                            {/* KPI Cards */}
                            <div className="kpi-cards">
                                <div className="kpi-card kpi-primary">
                                    <div className="kpi-icon">📊</div>
                                    <div className="kpi-content">
                                        <div className="kpi-value">{totals.total.toLocaleString()}</div>
                                        <div className="kpi-label">Total Leads</div>
                                        <div className="kpi-sublabel">Last 10 Days</div>
                                    </div>
                                </div>

                                <div className="kpi-card kpi-success">
                                    <div className="kpi-icon">✅</div>
                                    <div className="kpi-content">
                                        <div className="kpi-value">{totals.approved.toLocaleString()}</div>
                                        <div className="kpi-label">Approved</div>
                                        <div className="kpi-sublabel">{totalConversion}% Conv. Rate</div>
                                    </div>
                                </div>

                                <div className="kpi-card kpi-danger">
                                    <div className="kpi-icon">❌</div>
                                    <div className="kpi-content">
                                        <div className="kpi-value">{totals.rejected.toLocaleString()}</div>
                                        <div className="kpi-label">Rejected</div>
                                        <div className="kpi-sublabel">{((totals.rejected / totals.total) * 100).toFixed(1)}%</div>
                                    </div>
                                </div>

                                <div className="kpi-card kpi-warning">
                                    <div className="kpi-icon">⏳</div>
                                    <div className="kpi-content">
                                        <div className="kpi-value">{totals.pending.toLocaleString()}</div>
                                        <div className="kpi-label">Pending</div>
                                        <div className="kpi-sublabel">{((totals.pending / totals.total) * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="reports-table-container">
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Agent Name</th>
                                            <th>Total Leads</th>
                                            <th>Approved</th>
                                            <th>Rejected</th>
                                            <th>Pending</th>
                                            <th>Conversion %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index}>
                                                <td>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td>{row.agent}</td>
                                                <td>{row.total}</td>
                                                <td>
                                                    <span className="badge badge-success">{row.approved}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-danger">{row.rejected}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-warning">{row.pending}</span>
                                                </td>
                                                <td className="conversion-cell">{row.conversion}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="total-row">
                                            <td colSpan={2}><strong>TOTAL</strong></td>
                                            <td><strong>{totals.total}</strong></td>
                                            <td>
                                                <span className="badge badge-success"><strong>{totals.approved}</strong></span>
                                            </td>
                                            <td>
                                                <span className="badge badge-danger"><strong>{totals.rejected}</strong></span>
                                            </td>
                                            <td>
                                                <span className="badge badge-warning"><strong>{totals.pending}</strong></span>
                                            </td>
                                            <td className="conversion-cell"><strong>{totalConversion}%</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
