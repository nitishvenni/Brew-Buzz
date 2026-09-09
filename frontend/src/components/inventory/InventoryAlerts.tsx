import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export function InventoryAlerts({ alerts }: { alerts: any[] }) {
  const navigate = useNavigate();
  const displayAlerts = alerts.slice(0, 4);

  const getAlertStyle = (type: string) => {
    switch(type) {
      case 'CRITICAL_STOCK': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: AlertOctagon, iconColor: 'text-red-600', label: 'Critical Stock' };
      case 'HIGH_WASTAGE': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-500', label: 'High Wastage' };
      case 'HIGH_VARIANCE': return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: Info, iconColor: 'text-purple-500', label: 'High Variance' };
      default: return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', icon: AlertTriangle, iconColor: 'text-orange-500', label: type ? type.replace('_', ' ') : 'Alert' };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <h3 className="text-lg font-bold text-[#4a3b2c] mb-4">Smart Inventory Alerts</h3>
      {displayAlerts.length === 0 ? (
        <p className="text-[#8c7b6c] text-sm italic">No active alerts at this time.</p>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert, idx) => {
            const style = getAlertStyle(alert.alert_type);
            const Icon = style.icon;
            return (
              <div 
                key={idx} 
                onClick={() => navigate(`/inventory/${alert.inventory_item_id}`)}
                className={`p-4 border ${style.border} ${style.bg} rounded-xl hover:shadow-md cursor-pointer transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
                <p className="font-bold text-[#4a3b2c] text-sm mb-1">{alert.ingredient_name}</p>
                <p className="text-xs text-[#8c7b6c] mb-3 leading-relaxed">{alert.message}</p>
                <div className="flex items-center text-xs font-bold text-[#c89f70] group-hover:text-[#b08558]">
                  <span>Investigate</span>
                  <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
