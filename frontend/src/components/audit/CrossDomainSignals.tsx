import { AlertOctagon, AlertTriangle, ArrowRightLeft, Activity, Info } from 'lucide-react';
import type { AuditCrossDomainSignal } from '../../api/auditApi';

export function CrossDomainSignals({ signals, loading, error, onInvestigate }: { signals: AuditCrossDomainSignal[], loading: boolean, error: string | null, onInvestigate?: (signal: AuditCrossDomainSignal) => void }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm p-6 h-auto min-h-[400px] flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="flex-1 space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded w-full animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 h-auto min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertOctagon className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="font-bold">Failed to load signals</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm p-6 h-auto min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#fdfaf6] rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-[#c89f70]" />
        </div>
        <p className="text-[#8c7b6c] font-medium text-lg">No cross-domain signals detected for this period.</p>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-200 text-red-800', icon: AlertOctagon };
      case 'HIGH': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-200 text-rose-800', icon: AlertTriangle };
      case 'MEDIUM': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-200 text-amber-800', icon: Info };
      case 'LOW': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-200 text-blue-800', icon: Info };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-800', icon: Info };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-auto md:h-[600px]">
      <div className="p-6 border-b border-[#ece3d4] shrink-0">
        <h3 className="text-xl font-extrabold text-[#4a3b2c] flex items-center">
          Cross-Domain Signals
          <span className="ml-3 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {signals.length}
          </span>
        </h3>
        <p className="text-sm text-[#8c7b6c] font-medium mt-1">Automatically detected systemic relationships</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {signals.map((sig, idx) => {
          const styles = getSeverityStyles(sig.severity);
          const Icon = styles.icon;

          return (
            <div key={idx} className={`rounded-xl border ${styles.bg} ${styles.border} p-5 relative group`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-white shadow-sm border ${styles.border} ${styles.text}`}>
                    {sig.domain_a}
                  </div>
                  <ArrowRightLeft className={`w-4 h-4 ${styles.text} opacity-60`} />
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-white shadow-sm border ${styles.border} ${styles.text}`}>
                    {sig.domain_b}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
                  {sig.severity}
                </span>
              </div>

              <div className="flex items-start mt-2">
                <Icon className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${styles.text}`} />
                <div className="flex-1">
                  <h4 className={`text-base font-bold mb-1 ${styles.text}`}>{sig.title}</h4>
                  <p className={`text-sm font-medium mb-3 opacity-90 ${styles.text}`}>{sig.description}</p>
                  
                  {sig.evidence && sig.evidence.length > 0 && (
                    <div className="bg-white/60 rounded-lg p-3 border border-white/40 mb-3">
                      <p className={`text-xs font-bold uppercase mb-1.5 opacity-80 ${styles.text}`}>Evidence</p>
                      <ul className="space-y-1">
                        {sig.evidence.map((ev, i) => (
                          <li key={i} className={`text-sm flex items-start ${styles.text}`}>
                            <span className="mr-2 opacity-60">•</span>
                            <span className="opacity-90">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    {sig.outlet_id ? (
                      <div className={`text-xs font-bold uppercase opacity-80 ${styles.text}`}>
                        Outlet ID: {sig.outlet_id}
                      </div>
                    ) : <div></div>}
                    {onInvestigate && (
                      <button
                        onClick={() => onInvestigate(sig)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:shadow transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current ${styles.text} ${styles.border}`}
                      >
                        View Evidence <ArrowRightLeft className="w-3 h-3 ml-1.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
