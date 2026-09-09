import { IndianRupee, ShoppingBag, Coffee, ShieldCheck, Store } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

export function KPICards({ summary, activeOutlets, avgScore }: any) {
  const cards = [
    {
      label: "Total Revenue",
      value: summary?.revenue !== undefined ? formatCurrency(summary.revenue) : "₹0",
      icon: IndianRupee,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Total Orders",
      value: summary?.order_count !== undefined ? formatNumber(summary.order_count) : "0",
      icon: ShoppingBag,
      color: "text-amber-700",
      bg: "bg-amber-50"
    },
    {
      label: "Avg. Order Value",
      value: summary?.aov !== undefined ? formatCurrency(summary.aov) : "₹0",
      icon: Coffee,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      label: "Outlet Health Score",
      value: `${avgScore || 0} / 100`,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Active Outlets",
      value: activeOutlets !== undefined ? formatNumber(activeOutlets) : "0",
      icon: Store,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece3d4] transition-all hover:shadow-md">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", card.bg, card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#8c7b6c] truncate">{card.label}</p>
            </div>
            <h3 className="text-3xl font-extrabold text-[#4a3b2c] tracking-tight">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
