import type { MarketingAlert } from '../../api/marketingApi';
import { AlertCircle, ArrowUpCircle, ArrowDownCircle, Info, BellRing } from 'lucide-react';

interface MarketingAlertsProps {
  alerts: MarketingAlert[];
  loading: boolean;
}

export function MarketingAlerts({ alerts, loading }: MarketingAlertsProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm animate-pulse h-[400px]">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col items-center justify-center h-[400px]">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <BellRing className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-[#4a3b2c] font-bold text-lg">All Clear</p>
        <p className="text-[#8c7b6c] font-medium text-center mt-1">No significant marketing anomalies detected.</p>
      </div>
    );
  }

  const getAlertIcon = (type: string, severity: string) => {
    if (type.includes('SURGE')) return <ArrowUpCircle className="w-6 h-6 text-emerald-500 shrink-0" />;
    if (type.includes('DECLINE') || type.includes('DROP')) {
      return severity === 'HIGH' ? <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" /> : <ArrowDownCircle className="w-6 h-6 text-orange-500 shrink-0" />;
    }
    return <Info className="w-6 h-6 text-blue-500 shrink-0" />;
  };

  const getAlertBg = (type: string, severity: string) => {
    if (type.includes('SURGE')) return "bg-emerald-50 border-emerald-100";
    if (type.includes('DECLINE') || type.includes('DROP')) {
      return severity === 'HIGH' ? "bg-rose-50 border-rose-100" : "bg-orange-50 border-orange-100";
    }
    return "bg-blue-50 border-blue-100";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-extrabold text-[#4a3b2c] flex items-center">
            Marketing Alerts
            <span className="ml-3 bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          </h3>
          <p className="text-sm text-[#8c7b6c] font-medium">Anomalies and major demand shifts</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-4 ${getAlertBg(alert.type, alert.severity)}`}>
            {getAlertIcon(alert.type, alert.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#4a3b2c] text-sm uppercase tracking-wider">{alert.type.replace(/_/g, ' ')}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  alert.severity === 'HIGH' ? 'bg-rose-200 text-rose-800' : 
                  alert.severity === 'MEDIUM' ? 'bg-orange-200 text-orange-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-[#5c4d3c] text-sm font-medium mb-1">
                <span className="font-bold text-[#4a3b2c] mr-2">{alert.entity_name}</span>
              </p>
              <p className="text-[#7a6b5d] text-sm">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
