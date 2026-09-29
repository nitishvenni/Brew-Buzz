import type { OutletMarketingMetrics, MarketingSignal } from '../../api/marketingApi';
import { ArrowUpRight, ArrowDownRight, Minus, MapPin } from 'lucide-react';

interface OutletMarketingTableProps {
  outlets: OutletMarketingMetrics[];
  loading: boolean;
}

function SignalBadge({ signal }: { signal: MarketingSignal }) {
  switch (signal) {
    case 'SURGING':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">Surging</span>;
    case 'GROWING':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Growing</span>;
    case 'DECLINING':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">Declining</span>;
    case 'STABLE':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">Stable</span>;
    case 'NO_BASELINE':
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">New / No Baseline</span>;
  }
}

export function OutletMarketingTable({ outlets, loading }: OutletMarketingTableProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm animate-pulse h-[400px]">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!outlets || outlets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col items-center justify-center h-[400px]">
        <MapPin className="w-12 h-12 text-[#ece3d4] mb-3" />
        <p className="text-[#8c7b6c] font-medium text-center">No outlet data available for this period.</p>
      </div>
    );
  }

  const sortedOutlets = [...outlets].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-6 border-b border-[#ece3d4] shrink-0">
        <h3 className="text-lg font-extrabold text-[#4a3b2c]">Geographic Demand</h3>
        <p className="text-sm text-[#8c7b6c] font-medium">Outlet sales volume and growth</p>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#fdfaf6] sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider">Outlet</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider text-right">Revenue</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider text-right">Orders</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider text-right">AOV</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider text-right">Rev. Growth</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider text-right">Ord. Growth</th>
              <th className="py-3 px-6 text-xs font-bold text-[#8c7b6c] uppercase tracking-wider">Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]">
            {sortedOutlets.map((o) => (
              <tr key={o.outlet_id} className="hover:bg-[#fcf9f5] transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-[#4a3b2c] flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#c89f70] shrink-0" />
                    {o.outlet_name}
                  </div>
                </td>
                <td className="py-4 px-6 text-right font-medium text-[#4a3b2c]">
                  ₹{o.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-4 px-6 text-right font-medium text-[#7a6b5d]">
                  {o.orders.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-6 text-right font-medium text-[#7a6b5d]">
                  ₹{o.aov.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-4 px-6 text-right">
                  {o.revenue_growth_pct === null ? (
                    <span className="text-[#8c7b6c] text-sm flex items-center justify-end"><Minus className="w-3 h-3 mr-1" /> N/A</span>
                  ) : o.revenue_growth_pct > 0 ? (
                    <span className="text-emerald-600 text-sm font-bold flex items-center justify-end"><ArrowUpRight className="w-3 h-3 mr-1" /> {o.revenue_growth_pct.toFixed(1)}%</span>
                  ) : o.revenue_growth_pct < 0 ? (
                    <span className="text-rose-600 text-sm font-bold flex items-center justify-end"><ArrowDownRight className="w-3 h-3 mr-1" /> {Math.abs(o.revenue_growth_pct).toFixed(1)}%</span>
                  ) : (
                    <span className="text-[#8c7b6c] text-sm flex items-center justify-end"><Minus className="w-3 h-3 mr-1" /> 0%</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {o.order_growth_pct === null ? (
                    <span className="text-[#8c7b6c] text-sm flex items-center justify-end"><Minus className="w-3 h-3 mr-1" /> N/A</span>
                  ) : o.order_growth_pct > 0 ? (
                    <span className="text-emerald-600 text-sm font-bold flex items-center justify-end"><ArrowUpRight className="w-3 h-3 mr-1" /> {o.order_growth_pct.toFixed(1)}%</span>
                  ) : o.order_growth_pct < 0 ? (
                    <span className="text-rose-600 text-sm font-bold flex items-center justify-end"><ArrowDownRight className="w-3 h-3 mr-1" /> {Math.abs(o.order_growth_pct).toFixed(1)}%</span>
                  ) : (
                    <span className="text-[#8c7b6c] text-sm flex items-center justify-end"><Minus className="w-3 h-3 mr-1" /> 0%</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <SignalBadge signal={o.signal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
