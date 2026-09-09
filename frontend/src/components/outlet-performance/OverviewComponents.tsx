import { useNavigate } from 'react-router-dom';
import { Store, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell as PieCell } from 'recharts';
import { formatCurrency, formatNumber, cn } from '../../lib/utils';

export function OutletKPIs({ summary, activeOutlets, avgScore }: any) {
  const cards = [
    { label: "Total Outlets", value: formatNumber(activeOutlets || 0), bg: "bg-purple-50", color: "text-purple-600", icon: Store },
    { label: "Total Revenue", value: summary?.revenue !== undefined ? formatCurrency(summary.revenue) : "₹0", bg: "bg-orange-50", color: "text-orange-600", icon: Store },
    { label: "Total Orders", value: summary?.order_count !== undefined ? formatNumber(summary.order_count) : "0", bg: "bg-amber-50", color: "text-amber-700", icon: Store },
    { label: "Avg. Order Value", value: summary?.aov !== undefined ? formatCurrency(summary.aov) : "₹0", bg: "bg-orange-50", color: "text-orange-500", icon: Store },
    { label: "Average Health Score", value: `${Math.round(avgScore || 0)} / 100`, bg: "bg-green-50", color: "text-green-600", icon: Store }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece3d4] transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", card.bg, card.color)}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#8c7b6c] truncate">{card.label}</p>
          </div>
          <h3 className="text-2xl font-extrabold text-[#4a3b2c] tracking-tight">{card.value}</h3>
        </div>
      ))}
    </div>
  );
}

export function RevenueByOutletChart({ scores }: { scores: any[] }) {
  const data = [...scores].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-1">Revenue by Outlet</h3>
      <p className="text-sm text-[#8c7b6c] mb-6">Compare revenue across all outlets</p>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="outlet_name" axisLine={false} tickLine={false} tick={{ fill: '#8c7b6c', fontSize: 11 }} tickFormatter={(val) => val.replace('Brew Buzz ', '')} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c7b6c', fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000)}K`} />
            <RechartsTooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [formatCurrency(value as number), 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#c89f70' : '#e3cdae'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrdersByOutletChart({ scores }: { scores: any[] }) {
  const data = [...scores].sort((a, b) => b.order_count - a.order_count).slice(0, 5);
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-1">Orders by Outlet</h3>
      <p className="text-sm text-[#8c7b6c] mb-6">Total orders across outlets</p>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="outlet_name" axisLine={false} tickLine={false} tick={{ fill: '#8c7b6c', fontSize: 11 }} tickFormatter={(val) => val.replace('Brew Buzz ', '')} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c7b6c', fontSize: 11 }} />
            <RechartsTooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [formatNumber(value as number), 'Orders']}
            />
            <Bar dataKey="order_count" radius={[6, 6, 0, 0]} maxBarSize={50} fill="#e87c48" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthDistribution({ scores }: { scores: any[] }) {
  const bands = { Excellent: 0, Good: 0, Average: 0, "Needs Attention": 0 };
  scores.forEach(s => {
    if (s.overall_score >= 80) bands.Excellent++;
    else if (s.overall_score >= 60) bands.Good++;
    else if (s.overall_score >= 40) bands.Average++;
    else bands["Needs Attention"]++;
  });

  const data = [
    { name: 'Excellent', value: bands.Excellent, color: '#22c55e' },
    { name: 'Good', value: bands.Good, color: '#34d399' },
    { name: 'Average', value: bands.Average, color: '#fcd34d' },
    { name: 'Needs Attention', value: bands["Needs Attention"], color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-6">Outlet Health Score Distribution</h3>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-32 h-32 absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((entry, index) => <PieCell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#4a3b2c]">{scores.length}</span>
            <span className="text-[10px] text-[#8c7b6c] uppercase font-bold">Outlets</span>
          </div>
        </div>
        <div className="ml-auto w-1/2 space-y-3">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-sm text-[#4a3b2c] font-medium">{d.name}</span>
              </div>
              <span className="text-sm font-bold text-[#4a3b2c]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopPerformingOutlets({ scores }: { scores: any[] }) {
  const navigate = useNavigate();
  const sorted = [...scores].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-[#4a3b2c]">Top Performing Outlets</h3>
        <button className="text-sm font-medium text-[#c89f70] hover:text-[#b08558]">View all →</button>
      </div>
      <div className="space-y-4">
        {sorted.map((outlet, i) => (
          <div 
            key={outlet.outlet_id} 
            onClick={() => navigate(`/outlet-performance/${outlet.outlet_id}`)}
            className="flex items-center justify-between p-2 hover:bg-[#fdfaf6] rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center mr-3 shrink-0">{i+1}</div>
              <div className="w-10 h-10 rounded-xl bg-[#fdfaf6] text-[#c89f70] flex items-center justify-center mr-3 border border-[#ece3d4] shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-[#4a3b2c] truncate w-24">{outlet.outlet_name.replace('Brew Buzz ', '')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-[#4a3b2c]">{formatCurrency(outlet.revenue)}</span>
              {outlet.growth_percentage > 0 ? (
                <span className="text-xs font-bold text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" />{outlet.growth_percentage}%</span>
              ) : (
                <span className="text-xs font-bold text-red-600 flex items-center"><ArrowDownRight className="w-3 h-3 mr-0.5" />{Math.abs(outlet.growth_percentage)}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickInsights({ scores }: { scores: any[] }) {
  if (!scores.length) return null;
  const sorted = [...scores].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = scores.reduce((sum, s) => sum + s.revenue, 0);
  const topRevenue = sorted[0];
  const lowestGrowth = [...scores].sort((a, b) => a.growth_percentage - b.growth_percentage)[0];
  const aboveAverageCount = scores.filter(s => s.overall_score >= scores.reduce((acc, curr) => acc + curr.overall_score, 0) / scores.length).length;

  return (
    <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c89f70]/5 rounded-full blur-3xl pointer-events-none"></div>
      <h3 className="text-base font-bold text-[#4a3b2c] mb-6 flex items-center relative z-10">
        <Lightbulb className="w-4 h-4 text-[#c89f70] mr-2" /> Quick Insights
      </h3>
      <div className="space-y-5 relative z-10">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-sm text-[#8c7b6c]"><strong className="text-[#4a3b2c]">{topRevenue.outlet_name.replace('Brew Buzz ', '')}</strong> outlet contributes <strong>{((topRevenue.revenue / totalRevenue) * 100).toFixed(1)}%</strong> of total revenue.</p>
        </div>
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-sm text-[#8c7b6c]"><strong className="text-[#4a3b2c]">{lowestGrowth.outlet_name.replace('Brew Buzz ', '')}</strong> outlet revenue {lowestGrowth.growth_percentage < 0 ? 'declined by' : 'only grew by'} <strong>{Math.abs(lowestGrowth.growth_percentage)}%</strong>.</p>
        </div>
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mr-3 shrink-0 mt-0.5">
            <Store className="w-4 h-4 text-[#c89f70]" />
          </div>
          <p className="text-sm text-[#8c7b6c]"><strong>{aboveAverageCount} outlets</strong> are performing above the franchise average health score.</p>
        </div>
      </div>
    </div>
  );
}
