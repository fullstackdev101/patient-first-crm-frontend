'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface Activity {
    id: number;
    activity_type: string;
    activity_description: string;
    created_at: string;
    user_name: string;
    user_email: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axios.get('/activities/recent?limit=10');
                if (response.data.success) {
                    setActivities(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getActivityColor = (activityType: string) => {
        if (activityType.includes('created')) return 'primary';
        if (activityType.includes('status')) return 'purple';
        if (activityType.includes('comment')) return 'secondary';
        if (activityType.includes('assigned')) return 'amber';
        if (activityType.includes('deleted')) return 'rose';
        return 'primary';
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <p className="card-subtitle">Latest updates from your team</p>
            </div>
            <div className="card-content">
                <div className="activity-feed">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
                            Loading activities...
                        </div>
                    ) : activities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
                            No recent activities
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className={`activity-avatar ${getActivityColor(activity.activity_type)}`}>
                                    {getInitials(activity.user_name)}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-text">
                                        <span className="username">{activity.user_name}</span> {activity.activity_description}
                                    </p>
                                    <p className="activity-time">{getRelativeTime(activity.created_at)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
