
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TrendsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-96 flex items-center justify-center">
        <p className="text-[#8c7b6c]">No trend data available</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    revenue: parseFloat(d.revenue)
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-96">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Revenue & Orders Trend</h3>
        <div className="flex space-x-2 bg-[#fdfaf6] p-1 rounded-lg border border-[#ece3d4]">
          <button className="px-4 py-1.5 rounded-md bg-white text-[#c89f70] font-medium shadow-sm text-sm">Revenue</button>
          <button className="px-4 py-1.5 rounded-md text-[#8c7b6c] font-medium text-sm hover:text-[#4a3b2c]">Orders</button>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c89f70" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c89f70" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c7b6c', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c7b6c', fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000)}k`}
            />
            <CartesianGrid vertical={false} stroke="#ece3d4" strokeDasharray="4 4" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#4a3b2c', marginBottom: '4px' }}
              itemStyle={{ color: '#c89f70', fontWeight: '500' }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#c89f70" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#c89f70', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
