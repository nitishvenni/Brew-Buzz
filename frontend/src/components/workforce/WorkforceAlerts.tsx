import { AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WorkforceAlert } from '../../api/workforceApi';

export function WorkforceAlerts({ alerts }: { alerts: WorkforceAlert[] }) {
  const navigate = useNavigate();

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm p-6 h-full flex items-center justify-center">
        <p className="text-[#8c7b6c] font-medium text-sm text-center">
          No workforce alerts for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[#ece3d4] bg-[#fdfaf6]">
        <h3 className="text-sm font-bold text-[#4a3b2c] uppercase tracking-wider">Smart Alerts</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {alerts.map((alert, idx) => {
          const isHigh = alert.severity === 'HIGH';
          const Icon = isHigh ? AlertCircle : AlertTriangle;
          const bg = isHigh ? 'bg-red-50 hover:bg-red-100' : 'bg-amber-50 hover:bg-amber-100';
          const border = isHigh ? 'border-red-100' : 'border-amber-100';
          const text = isHigh ? 'text-red-700' : 'text-amber-700';

          return (
            <div 
              key={idx} 
              className={`p-4 mb-2 rounded-xl border transition-colors cursor-pointer flex items-start ${bg} ${border} group`}
              onClick={() => alert.outlet_id && navigate(`/workforce/outlet/${alert.outlet_id}`)}
            >
              <Icon className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${text}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-bold truncate ${text}`}>
                    {alert.outlet_name || "Franchise Wide"} - {alert.type.replace('_', ' ')}
                  </h4>
                  {alert.outlet_id && <ChevronRight className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ${text}`} />}
                </div>
                <p className={`text-xs font-medium opacity-90 ${text}`}>
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
