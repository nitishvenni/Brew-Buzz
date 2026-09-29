import { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WorkforceTrend } from '../../api/workforceApi';

type TrendType = 'attendance' | 'workload' | 'overtime';

export function WorkforceTrendsChart({ data, title = 'Workforce Trends' }: { data: WorkforceTrend[], title?: string }) {
  const [activeTab, setActiveTab] = useState<TrendType>('attendance');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-full flex items-center justify-center">
        <p className="text-[#8c7b6c] font-medium text-sm">No trend data available for this period</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    shortDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const renderChart = () => {
    if (activeTab === 'attendance') {
      return (
        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece3d4" />
          <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dx={-10} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#8c7b6c', fontWeight: 'bold', marginBottom: '4px' }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Attendance']}
          />
          <Area type="monotone" dataKey="attendance_rate" fill="#d1fae5" stroke="#10b981" strokeWidth={2} />
        </ComposedChart>
      );
    }
    
    if (activeTab === 'workload') {
      return (
        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece3d4" />
          <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dx={-10} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#8c7b6c', fontWeight: 'bold', marginBottom: '4px' }}
            formatter={(value) => [`${Number(value).toFixed(1)}`, 'Orders / Staff Hr']}
          />
          <Area type="monotone" dataKey="orders_per_staff_hour" fill="#fdf3eb" stroke="#c89f70" strokeWidth={2} />
        </ComposedChart>
      );
    }

    return (
      <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece3d4" />
        <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c7b6c' }} dx={-10} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          labelStyle={{ color: '#8c7b6c', fontWeight: 'bold', marginBottom: '4px' }}
          formatter={(value) => [`${Number(value).toFixed(1)} h`, 'Overtime']}
        />
        <Line type="monotone" dataKey="overtime_hours" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </ComposedChart>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h3 className="text-lg font-bold text-[#4a3b2c]">{title}</h3>
        <div className="flex bg-[#fdfaf6] p-1 rounded-lg border border-[#ece3d4]">
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'attendance' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[#8c7b6c] hover:text-[#4a3b2c]'}`}
          >
            Attendance
          </button>
          <button 
            onClick={() => setActiveTab('workload')}
            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'workload' ? 'bg-[#c89f70] text-white shadow-sm' : 'text-[#8c7b6c] hover:text-[#4a3b2c]'}`}
          >
            Workload
          </button>
          <button 
            onClick={() => setActiveTab('overtime')}
            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'overtime' ? 'bg-[#f59e0b] text-white shadow-sm' : 'text-[#8c7b6c] hover:text-[#4a3b2c]'}`}
          >
            Overtime
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
