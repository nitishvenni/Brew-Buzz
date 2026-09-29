import type { CategoryMarketingMetrics } from '../../api/marketingApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, PieChart as PieChartIcon } from 'lucide-react';

interface CategoryMarketingProps {
  categories: CategoryMarketingMetrics[];
  loading: boolean;
}

const COLORS = ['#c89f70', '#e87c48', '#8c7b6c', '#5c4d3c', '#d9b38c', '#bbaaa0', '#a65d37', '#7a6b5d'];

export function CategoryMarketing({ categories, loading }: CategoryMarketingProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm animate-pulse h-[400px]">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-48 rounded-full bg-gray-100 mx-auto"></div>
          <div className="flex-1 space-y-3 mt-4 md:mt-0">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-100 rounded w-full"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm h-[400px] flex flex-col items-center justify-center">
        <PieChartIcon className="w-12 h-12 text-[#ece3d4] mb-3" />
        <p className="text-[#8c7b6c] font-medium text-center">No category data available.</p>
      </div>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => b.revenue - a.revenue);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-[#ece3d4] shadow-lg rounded-xl">
          <p className="font-bold text-[#4a3b2c] mb-1">{data.category_name}</p>
          <p className="text-sm text-[#7a6b5d]">Revenue: ₹{data.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-sm text-[#7a6b5d]">Mix: {data.revenue_contribution_pct.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <h3 className="text-lg font-extrabold text-[#4a3b2c] mb-1">Category Mix Shift</h3>
      <p className="text-sm text-[#8c7b6c] font-medium mb-6">Revenue contribution across categories</p>
      
      <div className="flex flex-col xl:flex-row items-center gap-8">
        <div className="w-64 h-64 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedCategories}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="revenue"
                stroke="none"
              >
                {sortedCategories.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
            <span className="text-xs text-[#8c7b6c] font-bold uppercase tracking-wider">Top Cat</span>
            <span className="text-lg font-extrabold text-[#4a3b2c] text-center px-4 leading-tight truncate w-full">
              {sortedCategories[0]?.category_name || '-'}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {sortedCategories.map((c, index) => (
              <div key={c.category_id} className="flex items-center justify-between p-3 rounded-xl border border-[#ece3d4] hover:bg-[#fcf9f5] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#4a3b2c] truncate">{c.category_name}</p>
                    <p className="text-xs text-[#8c7b6c] font-medium">{c.revenue_contribution_pct.toFixed(1)}% mix</p>
                  </div>
                </div>
                
                <div className="text-right pl-4 shrink-0">
                  <p className="text-sm font-bold text-[#4a3b2c]">₹{c.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <div className="flex items-center justify-end">
                    {c.growth_pct === null ? (
                      <span className="text-[#8c7b6c] text-[11px] font-bold flex items-center"><Minus className="w-3 h-3 mr-0.5" /> N/A</span>
                    ) : c.growth_pct > 0 ? (
                      <span className="text-emerald-600 text-[11px] font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> {c.growth_pct.toFixed(1)}%</span>
                    ) : c.growth_pct < 0 ? (
                      <span className="text-rose-600 text-[11px] font-bold flex items-center"><ArrowDownRight className="w-3 h-3 mr-0.5" /> {Math.abs(c.growth_pct).toFixed(1)}%</span>
                    ) : (
                      <span className="text-[#8c7b6c] text-[11px] font-bold flex items-center"><Minus className="w-3 h-3 mr-0.5" /> 0%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
