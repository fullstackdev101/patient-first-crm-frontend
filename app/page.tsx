'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MetricCard from './components/MetricCard';
import Chart from './components/Chart';
import ActivityFeed from './components/ActivityFeed';
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

export default function Home() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Check authentication once hydration is complete
  useEffect(() => {
    // Wait for zustand to hydrate from localStorage
    if (!_hasHydrated) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    // Check if user is Agent and redirect to /leads
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        const userRole = authStorage.state?.user?.role?.trim();

        console.log('🔍 Dashboard - User role:', userRole);

        if (userRole === 'Agent') {
          console.log('🔄 Dashboard - Redirecting Agent to /leads');
          router.replace('/leads');
          return;
        }
      } catch (error) {
        console.error('Error parsing auth-storage from localStorage:', error);
      }
    }

    setIsAuthChecked(true);
  }, [token, router, _hasHydrated]);

  useEffect(() => {
    if (!isAuthChecked) return;

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
  }, [isAuthChecked]);

  // Calculate conversion rate (approved / total * 100)
  const conversionRate = stats && stats.totalLeads > 0
    ? ((stats.approved / stats.totalLeads) * 100).toFixed(1)
    : '0.0';

  const metrics = stats ? [
    { title: 'Total Leads', value: stats.totalLeads.toString(), iconColor: '#14b8a6', icon: '👥' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, iconColor: '#06b6d4', icon: '📈' },
    { title: 'Pending QA', value: stats.qaReview.toString(), iconColor: '#f59e0b', icon: '⏳' },
    { title: 'Rejected', value: stats.rejected.toString(), iconColor: '#ef4444', icon: '❌' },
  ] : [];

  // Don't render until auth is checked
  if (!isAuthChecked) {
    return null;
  }

  return (
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
              onClick={() => router.push('/leads/new')}
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
  );
}
