import { Package, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export function InventoryKPICards({ summary }: { summary: any }) {
  const kpis = [
    {
      label: 'Total Items',
      value: summary.total_items,
      description: 'Tracked inventory ingredients',
      icon: Package,
      color: 'text-[#8c7b6c]',
      bg: 'bg-[#fdfaf6]',
      border: 'border-[#ece3d4]'
    },
    {
      label: 'Healthy Stock',
      value: summary.healthy_items,
      description: `${Math.round((summary.healthy_items / (summary.total_items || 1)) * 100)}% inventory operating normally`,
      icon: ShieldCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100'
    },
    {
      label: 'Needs Attention',
      value: (summary.low_stock_items || 0) + (summary.watch_items || 0),
      description: 'Requires monitoring',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Critical Items',
      value: summary.critical_items,
      description: 'Immediate action required',
      icon: AlertOctagon,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.border} ${kpi.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#8c7b6c]">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold text-[#4a3b2c]">{kpi.value}</h3>
              <p className="text-xs text-[#bbaaa0] mt-0.5">{kpi.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
