import { ArrowRight, Sparkles, FileBarChart, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../lib/utils';

export function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Recent Orders</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558]">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#fdfaf6]">
            <tr>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4] rounded-tl-lg">#</th>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Outlet</th>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Items</th>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Date & Time</th>
              <th className="text-right text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4]">Amount</th>
              <th className="text-center text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-4 py-2 border-b border-[#ece3d4] rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {orders?.map((o: any) => (
              <tr key={o.id} className="hover:bg-[#fdfaf6]">
                <td className="px-4 py-3 text-sm text-[#8c7b6c]">#{o.id}</td>
                <td className="px-4 py-3 text-sm font-bold text-[#4a3b2c]">{o.outlet_name}</td>
                <td className="px-4 py-3 text-sm text-[#5c4d3c] truncate max-w-[200px]">
                  {o.items.slice(0, 2).join(", ")}{o.items.length > 2 ? ` +${o.items.length - 2} more` : ""}
                </td>
                <td className="px-4 py-3 text-sm text-[#8c7b6c]">
                  {format(new Date(o.timestamp), "MMM dd, yyyy • hh:mm a")}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-[#4a3b2c] whitespace-nowrap">{formatCurrency(o.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 capitalize border border-green-200">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="text-center py-4 text-[#8c7b6c]">No recent orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QuickActions() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-6">Quick Actions</h3>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <button className="w-full flex items-center p-3 rounded-xl border border-[#ece3d4] bg-[#fdfaf6] hover:bg-[#fdf3eb] hover:border-[#d48c48]/30 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-[#c89f70] text-white flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-medium text-[#4a3b2c]">Ask Brew Buzz AI</span>
        </button>
        <button className="w-full flex items-center p-3 rounded-xl border border-[#ece3d4] bg-[#fdfaf6] hover:bg-[#f5efe6] transition-all group cursor-not-allowed opacity-50" title="Coming soon">
          <div className="w-8 h-8 rounded-lg bg-white text-[#8c7b6c] border border-[#ece3d4] flex items-center justify-center mr-3">
            <Filter className="w-4 h-4" />
          </div>
          <span className="font-medium text-[#8c7b6c]">View Outlet Comparison</span>
        </button>
        <button className="w-full flex items-center p-3 rounded-xl border border-[#ece3d4] bg-[#fdfaf6] hover:bg-[#f5efe6] transition-all group cursor-not-allowed opacity-50" title="Coming soon">
          <div className="w-8 h-8 rounded-lg bg-white text-[#8c7b6c] border border-[#ece3d4] flex items-center justify-center mr-3">
            <FileBarChart className="w-4 h-4" />
          </div>
          <span className="font-medium text-[#8c7b6c]">Generate Report</span>
        </button>
      </div>
    </div>
  );
}
