import { useState, useEffect, useRef } from 'react';
import { X, Search, Sparkles, TrendingUp, TrendingDown, Store, AlertTriangle, Users, Package, Megaphone, Activity } from 'lucide-react';

import { fetchSummary } from '../../api/client';
import { fetchInventoryItems } from '../../api/inventoryApi';
import { getWorkforceSummary } from '../../api/workforceApi';
import { getMarketingSummary } from '../../api/marketingApi';
import { fetchAuditSignals } from '../../api/auditApi';
import type { AuditCrossDomainSignal } from '../../api/auditApi';
import type { WorkforceSummary } from '../../api/workforceApi';
import type { InvestigationContext } from './AuditAiPanel';

interface OutletIntelligenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  outletId: number;
  startDate: string;
  endDate: string;
  signalContext?: AuditCrossDomainSignal | null;
  onInvestigateAi: (context: InvestigationContext) => void;
}

export function OutletIntelligenceDrawer({
  isOpen,
  onClose,
  outletId,
  startDate,
  endDate,
  signalContext,
  onInvestigateAi
}: OutletIntelligenceDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  
  const [perfData, setPerfData] = useState<any>(null);
  const [perfError, setPerfError] = useState<string | null>(null);

  const [invData, setInvData] = useState<any[] | null>(null);
  const [invError, setInvError] = useState<string | null>(null);

  const [wfData, setWfData] = useState<WorkforceSummary | null>(null);
  const [wfError, setWfError] = useState<string | null>(null);

  const [mktData, setMktData] = useState<any>(null);
  const [mktError, setMktError] = useState<string | null>(null);

  const [auditData, setAuditData] = useState<AuditCrossDomainSignal[] | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      fetchSummary(startDate, endDate, outletId),
      fetchInventoryItems(outletId, startDate, endDate),
      getWorkforceSummary({ start_date: startDate, end_date: endDate, outlet_id: outletId }),
      getMarketingSummary(startDate, endDate, outletId),
      fetchAuditSignals(startDate, endDate, outletId)
    ]).then(([perf, inv, wf, mkt, audit]) => {
      if (!isMounted) return;

      if (perf.status === 'fulfilled') setPerfData(perf.value);
      else setPerfError("Unable to load performance data.");

      if (inv.status === 'fulfilled') setInvData(inv.value);
      else setInvError("Unable to load inventory data.");

      if (wf.status === 'fulfilled') setWfData(wf.value);
      else setWfError("Unable to load workforce data.");

      if (mkt.status === 'fulfilled') setMktData(mkt.value);
      else setMktError("Unable to load marketing data.");

      if (audit.status === 'fulfilled') setAuditData(audit.value);
      else setAuditError("Unable to load audit signals.");

      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [isOpen, outletId, startDate, endDate]);

  if (!isOpen) return null;

  const outletName = perfData?.outlet_name || mktData?.outlet_name || "Outlet";
  
  // Derived Inventory Metrics
  const criticalInv = invData ? invData.filter(i => i.status === 'CRITICAL') : [];
  const lowInv = invData ? invData.filter(i => i.status === 'LOW') : [];

  const handleInvestigate = () => {
    const compactContext = {
      revenue: perfData?.revenue,
      orders: perfData?.order_count,
      active_staff: wfData?.active_staff,
      attendance_rate: wfData?.attendance_rate,
      critical_inventory_count: criticalInv.length > 0 ? criticalInv.length : undefined,
      revenue_growth_pct: mktData?.revenue_growth_pct
    };

    if (signalContext) {
      onInvestigateAi({
        type: 'signal',
        outletId,
        title: signalContext.title,
        description: signalContext.description,
        evidence: signalContext.evidence,
        structured_evidence: signalContext.structured_evidence,
        domainA: signalContext.domain_a,
        domainB: signalContext.domain_b,
        outlet_context: compactContext
      });
    } else {
      onInvestigateAi({
        outletId,
        type: 'general',
        title: `Operational Context for ${outletName}`,
        outlet_context: compactContext
      });
    }
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
              <Store className="w-5 h-5 mr-2 text-[#c89f70]" />
              Outlet Intelligence
            </h2>
            <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mt-1">{outletName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#8c7b6c] hover:bg-[#faf8f5] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white p-4 rounded-xl border border-[#ece3d4] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PERFORMANCE */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c7b6c] mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Performance
                </h3>
                <div className="bg-white rounded-xl border border-[#ece3d4] p-4 shadow-sm">
                  {perfError ? (
                    <div className="text-sm text-red-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> {perfError}</div>
                  ) : perfData ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Revenue</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">₹{perfData.revenue?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Orders</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">{perfData.order_count?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">AOV</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">₹{perfData.aov?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  ) : <div className="text-sm text-gray-500">No data available.</div>}
                </div>
              </section>

              {/* INVENTORY */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c7b6c] mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Inventory
                </h3>
                <div className="bg-white rounded-xl border border-[#ece3d4] p-4 shadow-sm">
                  {invError ? (
                    <div className="text-sm text-red-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> {invError}</div>
                  ) : invData ? (
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-[#8c7b6c] mb-1">Critical Items</p>
                          <p className="text-lg font-bold text-red-600">{criticalInv.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8c7b6c] mb-1">Low Stock</p>
                          <p className="text-lg font-bold text-orange-500">{lowInv.length}</p>
                        </div>
                      </div>
                      {criticalInv.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#ece3d4]">
                          <p className="text-xs font-bold text-[#8c7b6c] uppercase mb-2">Critical Attention</p>
                          <ul className="space-y-1">
                            {criticalInv.slice(0, 3).map((item, i) => (
                              <li key={i} className="text-sm text-[#4a3b2c]">
                                • {item.ingredient_name} — <span className="font-medium">{item.days_remaining != null ? `${item.days_remaining.toFixed(1)} days left` : 'N/A'}</span>
                              </li>
                            ))}
                            {criticalInv.length > 3 && <li className="text-xs text-gray-500 mt-1">+{criticalInv.length - 3} more</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : <div className="text-sm text-gray-500">No data available.</div>}
                </div>
              </section>

              {/* WORKFORCE */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c7b6c] mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Workforce
                </h3>
                <div className="bg-white rounded-xl border border-[#ece3d4] p-4 shadow-sm">
                  {wfError ? (
                    <div className="text-sm text-red-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> {wfError}</div>
                  ) : wfData ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Active Staff</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">{wfData.active_staff}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Attendance</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">{wfData.attendance_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Overtime</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">{wfData.overtime_hours.toFixed(1)} hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Workload</p>
                        <p className="text-lg font-bold text-[#4a3b2c]">{wfData.orders_per_staff_hour.toFixed(1)} orders/hr</p>
                      </div>
                    </div>
                  ) : <div className="text-sm text-gray-500">No data available.</div>}
                </div>
              </section>

              {/* MARKETING */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c7b6c] mb-3 flex items-center">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Marketing & Demand
                </h3>
                <div className="bg-white rounded-xl border border-[#ece3d4] p-4 shadow-sm">
                  {mktError ? (
                    <div className="text-sm text-red-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> {mktError}</div>
                  ) : mktData ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Revenue Growth</p>
                        <div className="flex items-center">
                          <p className="text-lg font-bold text-[#4a3b2c] mr-1">
                            {mktData.revenue_growth_pct != null ? `${mktData.revenue_growth_pct > 0 ? '+' : ''}${mktData.revenue_growth_pct.toFixed(1)}%` : 'N/A'}
                          </p>
                          {mktData.revenue_growth_pct != null && (
                            mktData.revenue_growth_pct >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#8c7b6c] mb-1">Order Growth</p>
                        <div className="flex items-center">
                          <p className="text-lg font-bold text-[#4a3b2c] mr-1">
                            {mktData.order_growth_pct != null ? `${mktData.order_growth_pct > 0 ? '+' : ''}${mktData.order_growth_pct.toFixed(1)}%` : 'N/A'}
                          </p>
                          {mktData.order_growth_pct != null && (
                            mktData.order_growth_pct >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : <div className="text-sm text-gray-500">No data available.</div>}
                </div>
              </section>

              {/* CROSS-DOMAIN SIGNALS */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c7b6c] mb-3 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Cross-Domain Signals
                </h3>
                <div className="space-y-3">
                  {auditError ? (
                    <div className="bg-white rounded-xl border border-[#ece3d4] p-4 text-sm text-red-600 flex items-center shadow-sm">
                      <AlertTriangle className="w-4 h-4 mr-2"/> {auditError}
                    </div>
                  ) : auditData && auditData.length > 0 ? (
                    auditData.map((sig, i) => (
                      <div key={i} className="bg-white rounded-xl border border-[#ece3d4] p-4 shadow-sm border-l-4 border-l-[#c89f70]">
                        <h4 className="text-sm font-bold text-[#4a3b2c] mb-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-[#c89f70]"/>
                          {sig.title}
                        </h4>
                        <p className="text-xs text-[#8c7b6c] opacity-90 leading-relaxed">{sig.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl border border-[#ece3d4] p-4 text-sm text-gray-500 shadow-sm">
                      No active cross-domain signals for this outlet.
                    </div>
                  )}
                </div>
              </section>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#ece3d4] bg-white shrink-0">
          <button
            onClick={handleInvestigate}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#4a3b2c] hover:bg-[#3d3228] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c89f70] shadow transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Investigate with Audit AI
          </button>
        </div>
      </div>
    </>
  );
}
