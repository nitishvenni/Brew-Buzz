import { ArrowUpRight, ArrowDownRight, Coffee, Pizza, CupSoda, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

const COLORS = ['#c89f70', '#e87c48', '#8c7b6c', '#ece3d4'];

const getProductIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return <Pizza className="w-5 h-5 text-[#e87c48]" />;
  if (lower.includes('coffee') || lower.includes('latte') || lower.includes('cappuccino') || lower.includes('americano') || lower.includes('espresso')) return <Coffee className="w-5 h-5 text-[#c89f70]" />;
  if (lower.includes('tea') || lower.includes('water') || lower.includes('soda')) return <CupSoda className="w-5 h-5 text-[#8c7b6c]" />;
  return <Package className="w-5 h-5 text-[#8c7b6c]" />;
};

export function TopProducts({ products }: { products: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#ece3d4] flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Top Products</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558] transition-colors">
          View all <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-[#fdfaf6] sticky top-0 z-10">
            <tr>
              <th className="text-left text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Product</th>
              <th className="text-right text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Orders</th>
              <th className="text-right text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Sales (₹)</th>
              <th className="text-right text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {products?.map((product: any, idx: number) => (
              <tr key={idx} className="hover:bg-[#fdfaf6] transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mr-3 shrink-0">
                       {getProductIcon(product.product_name)}
                    </div>
                    <span className="font-bold text-[#4a3b2c] text-sm">{product.product_name}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right text-sm text-[#8c7b6c] font-medium">{formatNumber(product.order_count)}</td>
                <td className="px-6 py-3.5 text-right text-sm font-bold text-[#4a3b2c]">{formatCurrency(product.revenue)}</td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end">
                    {product.growth_percentage > 0 ? (
                      <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-0.5 rounded">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {product.growth_percentage}%
                      </span>
                    ) : product.growth_percentage < 0 ? (
                      <span className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-2 py-0.5 rounded">
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {Math.abs(product.growth_percentage)}%
                      </span>
                    ) : (
                      <span className="text-[#8c7b6c] text-sm font-bold bg-gray-50 px-2 py-0.5 rounded">0%</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CategoryPerformance({ categories, totalRevenue }: { categories: any[], totalRevenue: number }) {
  if (!categories || categories.length === 0) {
     return (
       <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full items-center justify-center">
         <p className="text-[#8c7b6c]">No category data available</p>
       </div>
     );
  }

  const chartData = categories.map(c => ({
    name: c.category_name,
    value: c.revenue,
    growth: c.growth_percentage
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#ece3d4] flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Category Performance</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558] transition-colors">
          View all <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative min-h-[250px]">
        <div className="w-full h-[180px] sm:h-[200px] mb-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: any) => formatCurrency(value as number)}
                contentStyle={{ borderRadius: '12px', border: '1px solid #ece3d4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4a3b2c', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-widest mb-0.5">Revenue Share</span>
            <span className="text-lg sm:text-xl font-extrabold text-[#4a3b2c]">
              ₹{(totalRevenue / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        <div className="w-full space-y-2">
          {chartData.slice(0, 4).map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="font-medium text-[#4a3b2c]">{entry.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-bold text-[#4a3b2c]">{((entry.value / totalRevenue) * 100).toFixed(1)}%</span>
                <span className={cn("text-xs font-bold w-14 text-right", entry.growth >= 0 ? "text-green-600" : "text-red-600")}>
                   {entry.growth > 0 ? '↑' : entry.growth < 0 ? '↓' : ''} {Math.abs(entry.growth)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PromoCard() {
  return (
    <div className="h-full rounded-2xl overflow-hidden relative shadow-sm border border-[#ece3d4] group cursor-pointer bg-black">
      <img src="/images/promo.jpg" alt="Pizza Meets Coffee Promo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4a3b2c]/80 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <button className="bg-[#c89f70] hover:bg-[#b08558] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md backdrop-blur-sm border border-white/20 flex items-center">
          Explore Bestsellers <ArrowUpRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
