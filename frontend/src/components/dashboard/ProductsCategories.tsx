
import { ArrowRight, Pizza, Coffee, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatNumber } from '../../lib/utils';

export function TopProducts({ products }: { products: any[] }) {
  const getIcon = (category: string) => {
    if (category.toLowerCase().includes('pizza')) return <Pizza className="w-5 h-5" />;
    if (category.toLowerCase().includes('coffee') || category.toLowerCase().includes('beverage')) return <Coffee className="w-5 h-5" />;
    return <Utensils className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Top Products</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558]">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-[#fdfaf6] sticky top-0">
            <tr>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Product</th>
              <th className="text-right text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Orders</th>
              <th className="text-right text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {products?.slice(0, 5).map((p: any) => (
              <tr key={p.product_id} className="hover:bg-[#fdfaf6]">
                <td className="px-4 py-3">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#fdf3eb] text-[#d48c48] flex items-center justify-center mr-3 shrink-0">
                      {getIcon(p.category_name)}
                    </div>
                    <span className="font-bold text-[#4a3b2c] text-sm truncate">{p.product_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-[#8c7b6c] whitespace-nowrap">{formatNumber(p.order_count)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-[#4a3b2c] whitespace-nowrap">{formatCurrency(p.revenue)}</td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={3} className="text-center py-4 text-[#8c7b6c]">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const COLORS = ['#c89f70', '#e87c48', '#d48c48', '#f0b784', '#ece3d4'];

export function CategoryPerformance({ categories, totalRevenue }: { categories: any[], totalRevenue: number }) {
  const chartData = categories?.map(c => ({
    name: c.category_name,
    value: parseFloat(c.revenue)
  })) || [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Category Performance</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558]">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="w-full sm:w-1/2 h-48 relative flex-shrink-0">
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
              <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-[#8c7b6c]">Revenue</span>
            <span className="font-bold text-[#4a3b2c]">₹{(totalRevenue/1000).toFixed(1)}k</span>
          </div>
        </div>
        
        <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-4">
          {categories?.slice(0, 4).map((c: any, i: number) => (
            <div key={c.category_id} className="flex justify-between items-center">
              <div className="flex items-center min-w-0 mr-2">
                <span className="w-3 h-3 rounded-full shrink-0 mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-sm font-bold text-[#4a3b2c] truncate">{c.category_name}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-[#4a3b2c] block">{parseFloat(c.revenue_percentage).toFixed(1)}%</span>
                <span className="text-xs text-[#8c7b6c]">₹{(parseFloat(c.revenue)/1000).toFixed(1)}k</span>
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
    <div className="bg-[#4a3b2c] rounded-2xl p-6 shadow-md h-full relative overflow-hidden flex flex-col justify-between group">
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#c89f70] rounded-full opacity-20 group-hover:scale-110 transition-transform duration-700 blur-xl"></div>
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#e87c48] rounded-full opacity-20 group-hover:scale-110 transition-transform duration-700 blur-xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-serif italic text-[#fdfaf6] mb-2">Pizza<br/>Meets<br/>Coffee</h3>
        <p className="text-[#ece3d4] text-sm mt-2 opacity-90">Great combo.<br/>Greater happiness.</p>
      </div>
      
      <button className="relative z-10 mt-6 bg-[#c89f70] hover:bg-[#b08558] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start border border-[#d48c48]/50 shadow-sm">
        Explore Bestsellers →
      </button>
    </div>
  );
}
