import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function InventoryHealthOverview({ summary }: { summary: any }) {
  const data = [
    { name: 'Healthy', value: summary.healthy_items, color: '#16a34a', bg: 'bg-green-500' },
    { name: 'Low Stock', value: summary.low_stock_items || summary.low_items || 0, color: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Critical', value: summary.critical_items, color: '#dc2626', bg: 'bg-red-600' },
    { name: 'Overstock', value: summary.overstock_items, color: '#9333ea', bg: 'bg-purple-600' }
  ].filter(item => item.value > 0);

  const total = summary.total_items || 1;
  const isGoodHealth = (summary.healthy_items / total) > 0.7;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
      {/* Left: Title & Donut Chart */}
      <div className="flex flex-row items-center gap-6 shrink-0">
        <div className="w-32 h-32 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '4px 8px' }}
                itemStyle={{ color: '#4a3b2c', fontWeight: 'bold', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-[#4a3b2c]">{summary.total_items}</span>
            <span className="text-[9px] font-bold text-[#8c7b6c] uppercase tracking-wider">Total</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#4a3b2c]">Inventory Health</h3>
          <p className="text-sm text-[#8c7b6c]">Real-time stock across franchise</p>
        </div>
      </div>

      {/* Center: Health Distribution Breakdown */}
      <div className="flex-1 w-full max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {data.map((item, idx) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-bold text-[#4a3b2c] flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mr-2 ${item.bg}`}></div>
                    {item.name}
                  </span>
                  <span className="font-extrabold text-[#4a3b2c]">{item.value} <span className="text-xs text-[#8c7b6c] font-normal ml-1">({percentage}%)</span></span>
                </div>
                <div className="w-full h-1.5 bg-[#f5f0e6] rounded-full overflow-hidden">
                  <div className={`h-full ${item.bg}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Overall Health Summary */}
      <div className="w-full lg:w-64 shrink-0 bg-[#fdfaf6] p-4 rounded-xl border border-[#ece3d4]">
        <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2 border-b border-[#ece3d4] pb-2">Overall Summary</p>
        <p className="text-sm text-[#4a3b2c] leading-relaxed">
          {isGoodHealth ? (
            <>
              <span className="text-green-600 font-bold block mb-1">Good Status</span>
              {summary.healthy_items} of {summary.total_items} items are operating within healthy stock levels.
            </>
          ) : (
            <>
              <span className="text-amber-600 font-bold block mb-1">Needs Attention</span>
              Multiple items require reordering or close monitoring to prevent stockouts.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
