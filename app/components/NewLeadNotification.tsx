'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import axios from '@/lib/axios';

export default function NewLeadNotification() {
    const { user } = useAuthStore();
    const [newLeadsCount, setNewLeadsCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [lastCheckedCount, setLastCheckedCount] = useState(0);

    useEffect(() => {
        // Only show notifications for Manager role
        const userRole = user?.role?.trim();
        if (userRole !== 'Manager') {
            return;
        }

        // Check for new leads every 30 seconds
        const checkNewLeads = async () => {
            try {
                const response = await axios.get('/leads?page=1&limit=1');
                if (response.data.success) {
                    const totalLeads = response.data.data.total;

                    // If this is the first check, just store the count
                    if (lastCheckedCount === 0) {
                        setLastCheckedCount(totalLeads);
                        return;
                    }

                    // If there are new leads since last check
                    if (totalLeads > lastCheckedCount) {
                        const newCount = totalLeads - lastCheckedCount;
                        setNewLeadsCount(newCount);
                        setShowNotification(true);
                        setLastCheckedCount(totalLeads);
                        // Notification will stay visible until user manually closes it
                    }
                }
            } catch (error) {
                console.error('Error checking for new leads:', error);
            }
        };

        // Initial check
        checkNewLeads();

        // Set up polling interval (every 30 seconds)
        const interval = setInterval(checkNewLeads, 30000);

        return () => clearInterval(interval);
    }, [user, lastCheckedCount]);

    if (!showNotification) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                color: 'white',
                padding: '20px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                minWidth: '300px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    🔔
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        New Leads Created!
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        {newLeadsCount} {newLeadsCount === 1 ? 'new lead has' : 'new leads have'} been added
                    </div>
                </div>
                <button
                    onClick={() => setShowNotification(false)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                    ×
                </button>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
