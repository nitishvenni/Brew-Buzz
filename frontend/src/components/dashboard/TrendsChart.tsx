import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export function TrendsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-full flex items-center justify-center">
        <p className="text-[#8c7b6c]">No trend data available</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    revenue: parseFloat(d.revenue),
    orders: parseInt(d.order_count) || 0,
    shortDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
        <div>
           <h3 className="text-lg font-bold text-[#4a3b2c] mb-3">Revenue & Orders Trend</h3>
           <div className="flex items-center space-x-6 text-sm font-medium">
             <div className="flex items-center text-[#c89f70]">
               <div className="w-4 h-1 bg-[#c89f70] rounded-full mr-2"></div> Revenue (₹)
             </div>
             <div className="flex items-center text-[#e87c48]">
               <div className="w-4 h-0.5 border-t-2 border-dashed border-[#e87c48] mr-2"></div> Orders
             </div>
           </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="flex space-x-1 bg-[#fdfaf6] p-1 rounded-lg border border-[#ece3d4]">
            <button className="px-4 py-1.5 rounded-md bg-[#c89f70] text-white font-medium shadow-sm text-sm transition-colors">Revenue</button>
            <button className="px-4 py-1.5 rounded-md text-[#8c7b6c] hover:text-[#4a3b2c] font-medium text-sm transition-colors">Orders</button>
            <button className="px-4 py-1.5 rounded-md text-[#8c7b6c] hover:text-[#4a3b2c] font-medium text-sm transition-colors">AOV</button>
          </div>
          <div className="flex items-center bg-[#fdfaf6] border border-[#ece3d4] rounded-lg px-3 py-1.5 text-sm font-medium text-[#4a3b2c] cursor-pointer hover:border-[#c89f70] transition-colors">
            Daily <ChevronDown className="w-4 h-4 text-[#8c7b6c] ml-2" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c89f70" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#c89f70" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="shortDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c7b6c', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c7b6c', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `₹${(value / 1000)}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c7b6c', fontSize: 12, fontWeight: 500 }}
            />
            <CartesianGrid vertical={false} stroke="#ece3d4" strokeDasharray="4 4" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
              labelStyle={{ fontWeight: 'bold', color: '#4a3b2c', marginBottom: '8px' }}
              itemStyle={{ fontWeight: '600', paddingBottom: '4px' }}
              formatter={(value: any, name: any) => {
                 if (name === "revenue") return [formatCurrency(value as number), "Revenue"];
                 if (name === "orders") return [formatNumber(value as number), "Orders"];
                 return [value, String(name)];
              }}
              labelFormatter={(label) => `${label}, 2026`}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#c89f70" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#c89f70', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#e87c48"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: '#e87c48', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
