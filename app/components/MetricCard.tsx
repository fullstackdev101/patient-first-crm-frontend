interface MetricCardProps {
    title: string;
    value: string;
    iconColor: string; // Changed to string to accept hex colors
    icon?: string; // Optional emoji icon
}

export default function MetricCard({ title, value, iconColor, icon }: MetricCardProps) {
    const getIcon = () => {
        // If emoji icon is provided, use it
        if (icon) {
            return <span style={{ fontSize: '24px' }}>{icon}</span>;
        }

        // Otherwise use SVG icons
        switch (title) {
            case "Total Leads":
                return (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                        </path>
                    </svg>
                );
            case "Conversion Rate":
                return (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                );
            case "Pending QA":
                return (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case "Rejected":
                return (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="metric-card">
            <div className="metric-header">
                <div className="metric-info">
                    <h3>{title}</h3>
                    <div className="metric-value">{value}</div>
                </div>
                <div
                    className="metric-icon"
                    style={{
                        backgroundColor: `${iconColor}15`,
                        color: iconColor
                    }}
                >
                    {getIcon()}
                </div>
            </div>
        </div>
    );
}
