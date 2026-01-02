'use client';

import { useState } from 'react';

interface ChartProps {
    monthlyData: { month: string; count: number }[];
    loading: boolean;
}

export default function Chart({ monthlyData, loading }: ChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Calculate max value for scaling
    const maxValue = Math.max(...monthlyData.map(d => d.count), 1);

    // Convert data to chart format with heights
    const chartData = monthlyData.map(data => ({
        month: data.month,
        value: data.count,
        height: (data.count / maxValue) * 100
    }));

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Approved Leads Over Time</h3>
                <p className="card-subtitle">Monthly approved leads trends</p>
            </div>
            <div className="card-content">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                        Loading chart data...
                    </div>
                ) : chartData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                        No data available
                    </div>
                ) : (
                    <>
                        <div className="chart-container" style={{ position: 'relative' }}>
                            {chartData.map((data, index) => (
                                <div
                                    key={index}
                                    className="chart-bar"
                                    style={{ height: `${data.height}%`, position: 'relative' }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {hoveredIndex === index && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            marginBottom: '8px',
                                            padding: '6px 12px',
                                            background: 'var(--gray-900)',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            zIndex: 10,
                                            pointerEvents: 'none'
                                        }}>
                                            {data.month}: {data.value} approved
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '4px solid transparent',
                                                borderRight: '4px solid transparent',
                                                borderTop: '4px solid var(--gray-900)'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            {chartData.map((data, index) => (
                                <span key={index}>{data.month}</span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
