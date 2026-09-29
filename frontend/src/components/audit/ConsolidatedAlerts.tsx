import { AlertOctagon, AlertTriangle, ShieldAlert, Package, Users, Store, TrendingDown } from 'lucide-react';
import type { AuditAlert } from '../../api/auditApi';

export function ConsolidatedAlerts({ alerts, loading, error, onInvestigate }: { alerts: AuditAlert[], loading: boolean, error: string | null, onInvestigate?: (alert: AuditAlert) => void }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm p-6 h-auto min-h-[400px] flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded w-full animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 h-auto min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertOctagon className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="font-bold">Failed to load alerts</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm p-6 h-auto min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#fdfaf6] rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-[#c89f70]" />
        </div>
        <p className="text-[#8c7b6c] font-medium text-lg">No alerts detected for this period.</p>
      </div>
    );
  }

  // Stable sort by severity
  const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedAlerts = [...alerts].sort((a, b) => {
    const orderA = severityOrder[a.severity.toUpperCase()] ?? 99;
    const orderB = severityOrder[b.severity.toUpperCase()] ?? 99;
    return orderA - orderB;
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', badge: 'bg-red-200 text-red-800' };
      case 'HIGH': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', badge: 'bg-rose-200 text-rose-800' };
      case 'MEDIUM': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', badge: 'bg-amber-200 text-amber-800' };
      case 'LOW': return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', badge: 'bg-blue-200 text-blue-800' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-800' };
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'inventory': return Package;
      case 'workforce': return Users;
      case 'marketing': return TrendingDown;
      case 'outlet': return Store;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-auto md:h-[600px]">
      <div className="p-6 border-b border-[#ece3d4] shrink-0">
        <h3 className="text-xl font-extrabold text-[#4a3b2c] flex items-center">
          Consolidated Alerts
          <span className="ml-3 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </h3>
        <p className="text-sm text-[#8c7b6c] font-medium mt-1">Domain-specific attention areas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {sortedAlerts.map((alert, idx) => {
          const styles = getSeverityStyles(alert.severity);
          const DomainIcon = getDomainIcon(alert.domain);

          return (
            <div key={idx} className={`rounded-xl border p-4 flex items-start ${styles.bg} ${styles.border} group relative`}>
              <div className={`p-2 rounded-lg bg-white/60 border border-white/40 mr-4 shrink-0 ${styles.text}`}>
                <DomainIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text} opacity-80`}>
                      {alert.domain}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
                <h4 className={`text-sm font-bold mb-1 ${styles.text}`}>{alert.title}</h4>
                <p className={`text-sm font-medium opacity-90 mb-2 ${styles.text}`}>{alert.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(alert.metric_value != null || alert.threshold != null) && (
                      <div className={`text-xs font-bold bg-white/40 inline-block px-2 py-1 rounded ${styles.text}`}>
                        {alert.metric_value != null && `Metric: ${Number.isInteger(alert.metric_value) ? alert.metric_value : alert.metric_value.toFixed(1)} `}
                        {alert.threshold != null && `| Threshold: ${Number.isInteger(alert.threshold) ? alert.threshold : alert.threshold.toFixed(1)}`}
                      </div>
                    )}
                    {alert.outlet_id != null && (
                      <div className={`text-xs font-bold opacity-80 ${styles.text}`}>
                        Outlet ID: {alert.outlet_id}
                      </div>
                    )}
                  </div>
                  {onInvestigate && (
                    <button
                      onClick={() => onInvestigate(alert)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:shadow transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current ${styles.text} ${styles.border}`}
                    >
                      Investigate <ShieldAlert className="w-3 h-3 ml-1.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
