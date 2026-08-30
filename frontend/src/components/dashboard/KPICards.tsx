import { IndianRupee, ShoppingBag, Coffee, Activity, Store } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

export function KPICards({ summary, activeOutlets, avgScore }: any) {
  const cards = [
    {
      label: "Total Revenue",
      value: summary?.revenue !== undefined ? formatCurrency(summary.revenue) : "₹0.00",
      icon: IndianRupee,
      color: "text-[#d48c48]",
      bg: "bg-[#fdf3eb]"
    },
    {
      label: "Total Orders",
      value: summary?.order_count !== undefined ? formatNumber(summary.order_count) : "0",
      icon: ShoppingBag,
      color: "text-[#c89f70]",
      bg: "bg-[#fdfaf6]"
    },
    {
      label: "Avg. Order Value",
      value: summary?.aov !== undefined ? formatCurrency(summary.aov) : "₹0.00",
      icon: Coffee,
      color: "text-[#8c7b6c]",
      bg: "bg-[#f3ede4]"
    },
    {
      label: "Outlet Health Score",
      value: `${avgScore || 0} / 100`,
      icon: Activity,
      color: "text-[#4caf50]",
      bg: "bg-[#e8f5e9]"
    },
    {
      label: "Active Outlets",
      value: activeOutlets !== undefined ? formatNumber(activeOutlets) : "0",
      icon: Store,
      color: "text-[#9c27b0]",
      bg: "bg-[#f3e5f5]"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#ece3d4] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", card.bg, card.color)}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#8c7b6c] mb-1 truncate">{card.label}</p>
              <h3 className="text-2xl font-bold text-[#4a3b2c] truncate">{card.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
