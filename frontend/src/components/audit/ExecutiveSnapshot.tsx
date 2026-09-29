import { IndianRupee, ShoppingBag, Coffee, AlertTriangle, Users } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';
import type { AuditFranchiseSnapshot } from '../../api/auditApi';

interface ExecutiveSnapshotProps {
  snapshot: AuditFranchiseSnapshot | null;
}

export function ExecutiveSnapshot({ snapshot }: ExecutiveSnapshotProps) {
  if (!snapshot) return null;

  const { outlet_metrics, inventory_metrics, workforce_metrics, marketing_metrics } = snapshot;

  const cards = [
    {
      label: "Franchise Revenue",
      value: outlet_metrics.revenue != null ? formatCurrency(outlet_metrics.revenue) : "N/A",
      icon: IndianRupee,
      color: "text-orange-600",
      bg: "bg-orange-50",
      subtext: outlet_metrics.growth_pct != null 
        ? `${outlet_metrics.growth_pct > 0 ? '+' : ''}${outlet_metrics.growth_pct.toFixed(1)}% vs prev` 
        : null
    },
    {
      label: "Total Orders",
      value: outlet_metrics.orders != null ? formatNumber(outlet_metrics.orders) : "N/A",
      icon: ShoppingBag,
      color: "text-amber-700",
      bg: "bg-amber-50",
      subtext: marketing_metrics.order_growth_pct != null 
        ? `${marketing_metrics.order_growth_pct > 0 ? '+' : ''}${marketing_metrics.order_growth_pct.toFixed(1)}% vs prev` 
        : null
    },
    {
      label: "Critical Inventory",
      value: inventory_metrics.critical_items != null ? formatNumber(inventory_metrics.critical_items) : "N/A",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      subtext: inventory_metrics.total_inventory_value != null 
        ? `${formatCurrency(inventory_metrics.total_inventory_value)} total value`
        : null
    },
    {
      label: "Active Staff",
      value: workforce_metrics.active_staff != null ? formatNumber(workforce_metrics.active_staff) : "N/A",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      subtext: workforce_metrics.attendance_rate != null 
        ? `${workforce_metrics.attendance_rate.toFixed(1)}% attendance`
        : null
    },
    {
      label: "Avg. Order Value",
      value: outlet_metrics.aov != null ? formatCurrency(outlet_metrics.aov) : "N/A",
      icon: Coffee,
      color: "text-green-600",
      bg: "bg-green-50",
      subtext: marketing_metrics.aov_growth_pct != null 
        ? `${marketing_metrics.aov_growth_pct > 0 ? '+' : ''}${marketing_metrics.aov_growth_pct.toFixed(1)}% vs prev` 
        : null
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece3d4] transition-all hover:shadow-md">
          <div className="flex flex-col h-full justify-between">
            <div>
                <div className="flex items-center space-x-3 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", card.bg, card.color)}>
                    <card.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#8c7b6c] truncate">{card.label}</p>
                </div>
                <h3 className="text-3xl font-extrabold text-[#4a3b2c] tracking-tight">{card.value}</h3>
            </div>
            {card.subtext && (
              <p className="text-xs font-medium text-[#8c7b6c] mt-3">
                {card.subtext}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
