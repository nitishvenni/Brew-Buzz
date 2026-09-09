import { ArrowRight, Sparkles, FileBarChart, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#ece3d4] flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Recent Orders</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558] transition-colors">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#fdfaf6] sticky top-0">
            <tr>
              <th className="text-left text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">#</th>
              <th className="text-left text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Outlet</th>
              <th className="text-left text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Items</th>
              <th className="text-left text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Date & Time</th>
              <th className="text-right text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Amount</th>
              <th className="text-center text-xs font-bold text-[#bbaaa0] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {orders?.map((o: any) => (
              <tr key={o.id} className="hover:bg-[#fdfaf6] transition-colors">
                <td className="px-6 py-3.5 text-sm text-[#8c7b6c] font-medium">#{o.id}</td>
                <td className="px-6 py-3.5 text-sm font-bold text-[#4a3b2c]">{o.outlet_name}</td>
                <td className="px-6 py-3.5 text-sm text-[#5c4d3c] truncate max-w-[200px]">
                  {o.items.slice(0, 2).join(", ")}{o.items.length > 2 ? ` +${o.items.length - 2} more` : ""}
                </td>
                <td className="px-6 py-3.5 text-sm text-[#8c7b6c]">
                  {format(new Date(o.timestamp), "MMM dd, yyyy • hh:mm a")}
                </td>
                <td className="px-6 py-3.5 text-right text-sm font-bold text-[#4a3b2c] whitespace-nowrap">{formatCurrency(o.amount)}</td>
                <td className="px-6 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-600 border border-green-200 capitalize">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="text-center py-6 text-[#8c7b6c]">No recent orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-6">Quick Actions</h3>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <button 
          onClick={() => navigate('/outlet-performance')}
          className="w-full flex items-center p-3.5 rounded-xl border border-[#ece3d4] bg-[#fdfaf6] hover:bg-[#fdf3eb] hover:border-[#c89f70]/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#c89f70] text-white flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#4a3b2c] text-sm">Ask Brew Buzz AI</span>
        </button>
        <button className="w-full flex items-center p-3.5 rounded-xl border border-[#ece3d4] bg-white hover:bg-[#fdfaf6] transition-all group cursor-not-allowed opacity-60">
          <div className="w-8 h-8 rounded-lg bg-[#fdfaf6] text-[#8c7b6c] border border-[#ece3d4] flex items-center justify-center mr-3">
            <Filter className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#8c7b6c] text-sm">View Outlet Comparison</span>
        </button>
        <button className="w-full flex items-center p-3.5 rounded-xl border border-[#ece3d4] bg-white hover:bg-[#fdfaf6] transition-all group cursor-not-allowed opacity-60">
          <div className="w-8 h-8 rounded-lg bg-[#fdfaf6] text-[#8c7b6c] border border-[#ece3d4] flex items-center justify-center mr-3">
            <FileBarChart className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#8c7b6c] text-sm">Generate Report</span>
        </button>
      </div>
    </div>
  );
}
