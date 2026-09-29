import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { fetchAuditSnapshot, fetchAuditAlerts, fetchAuditSignals } from '../api/auditApi';
import type { AuditFranchiseSnapshot, AuditAlert, AuditCrossDomainSignal } from '../api/auditApi';
import { ExecutiveSnapshot } from '../components/audit/ExecutiveSnapshot';
import { CrossDomainSignals } from '../components/audit/CrossDomainSignals';
import { ConsolidatedAlerts } from '../components/audit/ConsolidatedAlerts';
import { AuditAiPanel, type InvestigationContext } from '../components/audit/AuditAiPanel';
import { CrossDomainEvidenceDrawer } from '../components/audit/CrossDomainEvidenceDrawer';
import { OutletIntelligenceDrawer } from '../components/audit/OutletIntelligenceDrawer';
import { DashboardDateFilter } from '../components/dashboard/DashboardDateFilter';
import type { DatePreset } from '../components/dashboard/DashboardDateFilter';
import { Loader2, Sparkles } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 29)).toISOString());
  const [endDate, setEndDate] = useState(startOfDay(new Date()).toISOString());
  
  const [auditSnapshot, setAuditSnapshot] = useState<AuditFranchiseSnapshot | null>(null);
  const [alerts, setAlerts] = useState<AuditAlert[]>([]);
  const [signals, setSignals] = useState<AuditCrossDomainSignal[]>([]);
  
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(true);
  
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [signalsError, setSignalsError] = useState<string | null>(null);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceContext, setEvidenceContext] = useState<AuditCrossDomainSignal | null>(null);
  const [investigationContext, setInvestigationContext] = useState<InvestigationContext>({ type: 'general' });
  const [outletIntelOpen, setOutletIntelOpen] = useState(false);
  const [outletIntelId, setOutletIntelId] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      setAlertsLoading(true);
      setSignalsLoading(true);
      setAlertsError(null);
      setSignalsError(null);
      
      try {
        const [auditSnap, alertsRes, signalsRes] = await Promise.allSettled([
          fetchAuditSnapshot(startDate, endDate),
          fetchAuditAlerts(startDate, endDate),
          fetchAuditSignals(startDate, endDate)
        ]);

        if (auditSnap.status === 'fulfilled') setAuditSnapshot(auditSnap.value);
        else setError("Failed to load snapshot");
        
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
        else setAlertsError("Failed to load alerts");
        
        if (signalsRes.status === 'fulfilled') setSignals(signalsRes.value);
        else setSignalsError("Failed to load signals");
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
        setAlertsLoading(false);
        setSignalsLoading(false);
      }
    }
    loadDashboard();
  }, [startDate, endDate]);

  const handleDateChange = (preset: DatePreset, customStart?: string, customEnd?: string) => {
    setDatePreset(preset);
    if (preset === 'custom' && customStart && customEnd) {
      setStartDate(customStart);
      setEndDate(customEnd);
    } else {
      let days = 30;
      if (preset === '7days') days = 7;
      if (preset === '90days') days = 90;
      setStartDate(startOfDay(subDays(new Date(), days - 1)).toISOString());
      setEndDate(startOfDay(new Date()).toISOString());
    }
  };

  const handleOpenAiGeneral = () => {
    setInvestigationContext({ type: 'general' });
    setAiPanelOpen(true);
  };

  const handleInvestigateSignal = (sig: AuditCrossDomainSignal) => {
    setEvidenceContext(sig);
    setEvidenceDrawerOpen(true);
  };

  const handleAiHandoff = (sig: AuditCrossDomainSignal) => {
    setEvidenceDrawerOpen(false);
    setInvestigationContext({
      type: 'signal',
      title: sig.title,
      description: sig.description,
      outletId: sig.outlet_id,
      evidence: sig.evidence,
      structured_evidence: sig.structured_evidence,
      domainA: sig.domain_a,
      domainB: sig.domain_b
    });
    setAiPanelOpen(true);
  };

  const handleOpenOutletIntelligence = (outletId: number) => {
    setEvidenceDrawerOpen(false);
    setOutletIntelId(outletId);
    setOutletIntelOpen(true);
  };

  const handleOutletAiHandoff = (context: InvestigationContext) => {
    setOutletIntelOpen(false);
    setInvestigationContext(context);
    setAiPanelOpen(true);
  };

  const handleInvestigateAlert = (alert: AuditAlert) => {
    setInvestigationContext({
      type: 'alert',
      title: alert.title,
      description: alert.description,
      outletId: alert.outlet_id,
      severity: alert.severity,
      domain: alert.domain
    });
    setAiPanelOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#4a3b2c]">Franchise Intelligence</h3>
          <p className="text-sm text-[#8c7b6c] mt-1">Cross-domain business intelligence for management attention and investigation.</p>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button 
            onClick={handleOpenAiGeneral}
            className="flex items-center bg-[#4a3b2c] hover:bg-[#3d3228] text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#c89f70] focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Ask Audit AI
          </button>
          <DashboardDateFilter 
            preset={datePreset}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#c89f70] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>
      ) : (
        auditSnapshot && <ExecutiveSnapshot snapshot={auditSnapshot} />
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <CrossDomainSignals signals={signals} loading={signalsLoading} error={signalsError} onInvestigate={handleInvestigateSignal} />
        <ConsolidatedAlerts alerts={alerts} loading={alertsLoading} error={alertsError} onInvestigate={handleInvestigateAlert} />
      </div>

      <AuditAiPanel 
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        startDate={startDate}
        endDate={endDate}
        context={investigationContext}
      />
      <CrossDomainEvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        signal={evidenceContext}
        onInvestigateAi={handleAiHandoff}
        onViewOutletIntelligence={handleOpenOutletIntelligence}
      />
      
      {outletIntelId != null && (
        <OutletIntelligenceDrawer
          isOpen={outletIntelOpen}
          onClose={() => setOutletIntelOpen(false)}
          outletId={outletIntelId}
          startDate={startDate}
          endDate={endDate}
          signalContext={evidenceContext}
          onInvestigateAi={handleOutletAiHandoff}
        />
      )}
    </Layout>
  );
}
