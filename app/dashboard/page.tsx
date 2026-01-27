'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProtectedRoute from '../components/ProtectedRoute';
import MetricCard from '../components/MetricCard';
import Chart from '../components/Chart';
import ActivityFeed from '../components/ActivityFeed';
import NewLeadNotification from '../components/NewLeadNotification';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store';


interface DashboardStats {
    totalLeads: number;
    pending: number;
    qaReview: number;
    rejected: number;
    approved: number;
    monthlyApproved: { month: string; count: number }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const { token, _hasHydrated } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for auth to be ready
        if (!_hasHydrated || !token) return;

        const fetchDashboardStats = async () => {
            try {
                const response = await axios.get('/dashboard/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [_hasHydrated, token]);

    // Calculate conversion rate (approved / total * 100)
    const conversionRate = stats && stats.totalLeads > 0
        ? ((stats.approved / stats.totalLeads) * 100).toFixed(1)
        : '0.0';

    const metrics = stats ? [
        { title: 'Total Leads', value: stats.totalLeads.toString(), iconColor: '#14b8a6', icon: '👥' },
        { title: 'Conversion Rate', value: `${conversionRate}%`, iconColor: '#06b6d4', icon: '📈' },
        { title: 'Pending', value: stats.qaReview.toString(), iconColor: '#f59e0b', icon: '⏳' },
        { title: 'Approved', value: stats.approved.toString(), iconColor: '#10b981', icon: '✅' },
        { title: 'Rejected', value: stats.rejected.toString(), iconColor: '#ef4444', icon: '❌' },
    ] : [];

    return (
        <ProtectedRoute>
            <NewLeadNotification />
            <div className="dashboard-container">
                <Sidebar />

                <div className="main-content">
                    <Topbar />

                    <main className="content">
                        <div className="page-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '24px'
                        }}>
                            <div>
                                <h2 className="page-title">Dashboard</h2>
                                <p className="page-subtitle">Overview of your lead management system</p>
                            </div>
                            <button
                                onClick={() => router.push('/leads/add')}
                                style={{
                                    background: '#14b8a6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 4px rgba(20, 184, 166, 0.2)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#0d9488'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#14b8a6'}
                            >
                                <span style={{ fontSize: '18px' }}>+</span>
                                Add New Lead
                            </button>
                        </div>

                        {/* Metrics Cards */}
                        <div className="metrics-grid">
                            {loading ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                                    Loading...
                                </div>
                            ) : (
                                metrics.map((metric, index) => (
                                    <MetricCard
                                        key={index}
                                        title={metric.title}
                                        value={metric.value}
                                        iconColor={metric.iconColor}
                                        icon={metric.icon}
                                    />
                                ))
                            )}
                        </div>

                        {/* Dashboard Grid */}
                        <div className="dashboard-grid">
                            <Chart monthlyData={stats?.monthlyApproved || []} loading={loading} />
                            <ActivityFeed />
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
