import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export function ConsumptionAnalysis({ detail, history }: { detail: any, history: any[] }) {
  // Aggregate history by day
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // Group consumptions by date string
    const consumptionByDate: Record<string, number> = {};
    
    history.forEach(tx => {
      if (tx.transaction_type === 'CONSUMPTION') {
        const dateStr = new Date(tx.created_at).toISOString().split('T')[0];
        // quantity is negative for consumption, make it positive for chart
        const amount = Math.abs(parseFloat(tx.quantity));
        consumptionByDate[dateStr] = (consumptionByDate[dateStr] || 0) + amount;
      }
    });

    const data = Object.keys(consumptionByDate).map(date => ({
      date,
      amount: parseFloat(consumptionByDate[date].toFixed(2))
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Show at most last 14 days for neatness
    return data.slice(-14);
  }, [history]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#4a3b2c] flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#c89f70]" />
            Consumption Trend
          </h3>
          <p className="text-sm text-[#8c7b6c] mt-1">Historical ingredient usage (Last 14 Days)</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-[#fdfaf6] border border-[#ece3d4] px-4 py-2 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">Avg Daily Usage</span>
            <span className="text-lg font-extrabold text-[#4a3b2c]">{detail.average_daily_consumption} <span className="text-xs font-bold text-[#8c7b6c]">{detail.unit}/day</span></span>
          </div>
          <TrendingUp className="w-5 h-5 text-green-600 opacity-80" />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-[#ece3d4] rounded-xl bg-[#fdfaf6]">
          <p className="text-[#8c7b6c] text-sm font-medium">No consumption history available to display.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c89f70" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c89f70" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece3d4" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => {
                  const d = new Date(tick);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }} 
                stroke="#8c7b6c" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#8c7b6c" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}${detail.unit}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4a3b2c', fontWeight: 'bold' }}
                labelStyle={{ color: '#8c7b6c', fontSize: '12px', marginBottom: '4px' }}
                formatter={(value: any) => [`${value} ${detail.unit}`, 'Consumption']}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#c89f70" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                activeDot={{ r: 6, fill: '#4a3b2c', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
