import { useState } from 'react';
import type { MarketingTrend } from '../../api/marketingApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MarketingTrendsChartProps {
  trends: MarketingTrend[];
  loading: boolean;
}

export function MarketingTrendsChart({ trends, loading }: MarketingTrendsChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'order_count'>('revenue');

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm animate-pulse h-[400px]">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-[#8c7b6c] font-medium">No trend data available for this period.</p>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (metric === 'revenue') {
      if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
      return `₹${value}`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#ece3d4] shadow-lg rounded-xl">
          <p className="font-bold text-[#4a3b2c] mb-2">{format(parseISO(label), 'MMM d, yyyy')}</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#c89f70]"></div>
            <p className="text-sm font-medium text-[#7a6b5d]">
              {metric === 'revenue' 
                ? `Revenue: ₹${payload[0].value.toLocaleString('en-IN')}`
                : `Orders: ${payload[0].value.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#4a3b2c]">Demand Trends</h3>
          <p className="text-sm text-[#8c7b6c] font-medium">Historical performance over time</p>
        </div>
        <div className="flex bg-[#fdfaf6] p-1 rounded-lg border border-[#ece3d4]">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${
              metric === 'revenue' ? 'bg-white shadow-sm text-[#c89f70]' : 'text-[#8c7b6c] hover:text-[#4a3b2c]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('order_count')}
            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${
              metric === 'order_count' ? 'bg-white shadow-sm text-[#c89f70]' : 'text-[#8c7b6c] hover:text-[#4a3b2c]'
            }`}
          >
            Orders
          </button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c89f70" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c89f70" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece3d4" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM d')}
              stroke="#bbaaa0"
              fontSize={12}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              stroke="#bbaaa0"
              fontSize={12}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={metric} 
              stroke="#c89f70" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              activeDot={{ r: 6, fill: '#c89f70', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
