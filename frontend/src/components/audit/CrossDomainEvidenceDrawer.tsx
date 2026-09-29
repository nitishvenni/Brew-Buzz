import { X, Search, Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { AuditCrossDomainSignal } from '../../api/auditApi';
import { cn } from '../../lib/utils';

interface CrossDomainEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  signal: AuditCrossDomainSignal | null;
  onInvestigateAi: (signal: AuditCrossDomainSignal) => void;
  onViewOutletIntelligence?: (outletId: number) => void;
}

export function CrossDomainEvidenceDrawer({ isOpen, onClose, signal, onInvestigateAi, onViewOutletIntelligence }: CrossDomainEvidenceDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !signal) return null;

  const renderTrendIcon = (direction?: string | null) => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return null;
  };

  const renderStatusBadge = (status?: string | null) => {
    if (!status) return null;
    
    let bg = 'bg-gray-100 text-gray-800 border-gray-200';
    let icon = null;
    
    if (['CRITICAL', 'Critical'].includes(status)) {
      bg = 'bg-red-100 text-red-800 border-red-200';
      icon = <AlertTriangle className="w-3 h-3 mr-1" />;
    } else if (['LOW', 'Needs Attention', 'ATTENTION'].includes(status)) {
      bg = 'bg-orange-100 text-orange-800 border-orange-200';
      icon = <AlertTriangle className="w-3 h-3 mr-1" />;
    } else if (['WATCH', 'Watch'].includes(status)) {
      bg = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      icon = <Info className="w-3 h-3 mr-1" />;
    } else if (['HEALTHY', 'Strong', 'Excellent'].includes(status)) {
      bg = 'bg-green-100 text-green-800 border-green-200';
      icon = <CheckCircle className="w-3 h-3 mr-1" />;
    }

    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", bg)}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in transition-opacity"
        onClick={onClose}
      />
      
      <div 
        ref={panelRef}
        className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-[#faf8f5] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right sm:border-l border-[#ece3d4]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ece3d4] bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#4a3b2c] flex items-center">
              <Search className="w-5 h-5 mr-2 text-[#c89f70]" />
              View Evidence
            </h2>
            <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mt-1">{signal.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#8c7b6c] hover:bg-[#f5efe6] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#c89f70]"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-6 p-4 bg-white rounded-xl border border-[#ece3d4] shadow-sm">
            <h3 className="text-sm font-bold text-[#4a3b2c] mb-2">Deterministic Explanation</h3>
            <p className="text-sm text-[#4a3b2c] opacity-90 leading-relaxed">
              {signal.description}
            </p>
          </div>

          <div className="space-y-6">
            {signal.structured_evidence && signal.structured_evidence.length > 0 ? (
              signal.structured_evidence.map((section, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#ece3d4] overflow-hidden shadow-sm">
                  <div className="bg-[#fdfaf6] px-4 py-3 border-b border-[#ece3d4]">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm border border-[#ece3d4] text-[#8c7b6c]">
                        {section.domain}
                      </span>
                      <h4 className="text-sm font-bold text-[#4a3b2c]">{section.title}</h4>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {section.metrics.map((metric, midx) => (
                      <div key={midx} className="flex flex-col">
                        <span className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-1">{metric.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-[#4a3b2c]">
                            {metric.value}
                            {metric.unit && <span className="text-sm text-[#8c7b6c] ml-1">{metric.unit}</span>}
                            {metric.comparison && <span className="text-xs font-medium text-[#8c7b6c] ml-1">{metric.comparison}</span>}
                          </span>
                          {renderTrendIcon(metric.direction)}
                          {renderStatusBadge(metric.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-[#ece3d4] overflow-hidden shadow-sm p-4">
                <p className="text-xs font-bold uppercase mb-2 opacity-80 text-[#8c7b6c]">Legacy Evidence</p>
                <ul className="space-y-2">
                  {signal.evidence.map((ev, i) => (
                    <li key={i} className="text-sm flex items-start text-[#4a3b2c]">
                      <span className="mr-2 opacity-60">•</span>
                      <span className="opacity-90">{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#ece3d4] bg-white shrink-0 flex flex-col gap-3">
          {onViewOutletIntelligence && signal.outlet_id && (
            <button
              onClick={() => onViewOutletIntelligence(signal.outlet_id!)}
              className="w-full flex justify-center items-center py-3 px-4 border border-[#c89f70] rounded-xl text-sm font-bold text-[#4a3b2c] bg-white hover:bg-[#faf8f5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c89f70] transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              View Outlet Intelligence
            </button>
          )}
          <button
            onClick={() => onInvestigateAi(signal)}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#4a3b2c] hover:bg-[#3d3228] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c89f70] shadow transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Investigate with Audit AI
          </button>
        </div>
      </div>
    </>
  );
}
