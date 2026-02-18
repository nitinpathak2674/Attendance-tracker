import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const Dashboard = ({ data }) => {
    const containerRef = useRef(null);
    const [chartSize, setChartSize] = useState({ width: 0, height: 220 });

    // Measure container width for responsive chart sizing
    const updateSize = () => {
        if (containerRef.current) {
            setChartSize({
                width: containerRef.current.offsetWidth,
                height: 220

            });
        }
    };

    // RESPONSIVENESS: Synchronizes component dimensions with window resize events and ensures clean memory management via event listener removal.

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-6 text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Attendance Analysis (Last 7 Days)
            </h3>
            
            <div ref={containerRef} className="w-full flex justify-center items-center" style={{ minHeight: '220px' }}>
                {chartSize.width > 0 ? (
                    <BarChart 
                        width={chartSize.width} 
                        height={chartSize.height} 
                        data={data} 
                        margin={{ top: 5, right: 30, left: -25, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10}}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#cbd5e1', fontSize: 10}}
                            allowDecimals={false}
                            domain={[0, 'dataMax + 2']}
                        />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                                fontSize: '11px'
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.count === 0 ? '#f1f5f9' : '#3b82f6'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <div className="text-slate-300 text-xs italic">Loading chart dimensions...</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;