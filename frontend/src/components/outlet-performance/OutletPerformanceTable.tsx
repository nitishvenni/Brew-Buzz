import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react';
import { formatCurrency, formatNumber, cn } from '../../lib/utils';

const getBandColor = (band: string) => {
  switch (band) {
    case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
    case 'Strong': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Watch': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Needs Attention': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

export function OutletPerformanceTable({ scores }: { scores: any[] }) {
  const navigate = useNavigate();
  const sorted = [...scores].sort((a, b) => b.overall_score - a.overall_score);

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-[#ece3d4] flex justify-between items-center bg-[#fdfaf6]">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Outlet Performance Overview</h3>
        <button className="text-sm font-bold text-[#4a3b2c] border border-[#ece3d4] px-4 py-2 rounded-lg bg-white hover:border-[#c89f70] transition-colors shadow-sm">
          Export
        </button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fcf9f2] text-left text-[#8c7b6c] uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4]">#</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4]">Outlet</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] hidden sm:table-cell">Revenue (₹)</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] hidden md:table-cell">Orders</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] hidden lg:table-cell">AOV (₹)</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] text-center">Score</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] hidden sm:table-cell">Growth</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4]">Status</th>
              <th className="px-6 py-4 font-bold border-b border-[#ece3d4] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {sorted.map((outlet, index) => (
              <tr 
                key={outlet.outlet_id}
                onClick={() => navigate(`/outlet-performance/${outlet.outlet_id}`)}
                className="hover:bg-[#fdfaf6] cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4 text-[#8c7b6c] font-bold">
                  {index === 0 ? <Crown className="w-4 h-4 text-[#c89f70]" /> : `${index + 1}.`}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#fdf3eb] text-[#c89f70] flex items-center justify-center mr-3 shrink-0 border border-[#ece3d4]">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#4a3b2c] truncate">{outlet.outlet_name}</p>
                      <p className="text-xs text-[#8c7b6c] truncate">Location Data</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-[#4a3b2c] hidden sm:table-cell">
                  {formatCurrency(outlet.revenue)}
                </td>
                <td className="px-6 py-4 text-[#8c7b6c] hidden md:table-cell">
                  {formatNumber(outlet.order_count)}
                </td>
                <td className="px-6 py-4 text-[#8c7b6c] hidden lg:table-cell">
                  {formatCurrency(outlet.aov)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm",
                    outlet.overall_score >= 90 ? "text-green-700 bg-green-50" :
                    outlet.overall_score >= 75 ? "text-emerald-700 bg-emerald-50" :
                    outlet.overall_score >= 60 ? "text-yellow-700 bg-yellow-50" :
                    outlet.overall_score >= 40 ? "text-orange-700 bg-orange-50" :
                    "text-red-700 bg-red-50"
                  )}>
                    {outlet.overall_score}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {outlet.growth_percentage > 0 ? (
                    <span className="flex items-center text-green-600 font-bold text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />{outlet.growth_percentage}%
                    </span>
                  ) : outlet.growth_percentage < 0 ? (
                    <span className="flex items-center text-red-600 font-bold text-xs">
                      <ArrowDownRight className="w-3 h-3 mr-1" />{Math.abs(outlet.growth_percentage)}%
                    </span>
                  ) : (
                    <span className="text-[#8c7b6c] text-xs font-bold">0%</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex px-2.5 py-1 rounded-md text-xs font-bold border", getBandColor(outlet.performance_band))}>
                    {outlet.performance_band}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center text-[#c89f70] font-bold text-sm group-hover:text-[#b08558] transition-colors">
                    View <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
