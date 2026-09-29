import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Loader2, ArrowLeft, Store } from 'lucide-react';
import { 
  getWorkforceSummary, 
  getWorkforceEmployees, 
  getWorkforceTrends, 
  getWorkforceAlerts
} from '../api/workforceApi';
import { getWorkforceOutlets } from '../api/workforceApi';
import type { WorkforceSummary, EmployeeWorkforceMetrics, WorkforceTrend, WorkforceAlert } from '../api/workforceApi';
import { WorkforceDateFilter } from '../components/workforce/WorkforceDateFilter';
import type { DatePreset } from '../components/workforce/WorkforceDateFilter';
import { WorkforceKPICards } from '../components/workforce/WorkforceKPICards';
import { WorkforceHealthOverview } from '../components/workforce/WorkforceHealthOverview';
import { WorkforceTrendsChart } from '../components/workforce/WorkforceTrendsChart';
import { WorkforceAlerts } from '../components/workforce/WorkforceAlerts';
import { WorkforceEmployeeDirectory } from '../components/workforce/WorkforceEmployeeDirectory';
import { StaffAiPanel } from '../components/workforce/StaffAiPanel';
import { subDays, startOfDay } from 'date-fns';

export function WorkforceOutletPage() {
  const { outletId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 29)).toISOString());
  const [endDate, setEndDate] = useState(startOfDay(new Date()).toISOString());

  const [summary, setSummary] = useState<WorkforceSummary | null>(null);
  const [outletName, setOutletName] = useState<string>('Outlet Detail');
  const [employees, setEmployees] = useState<EmployeeWorkforceMetrics[]>([]);
  const [trends, setTrends] = useState<WorkforceTrend[]>([]);
  const [alerts, setAlerts] = useState<WorkforceAlert[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!outletId) return;
      setLoading(true);
      setError(null);
      try {
        const params = { start_date: startDate, end_date: endDate, outlet_id: Number(outletId) };
        const globalParams = { start_date: startDate, end_date: endDate };
        const [sumRes, empRes, trRes, alRes, outletsRes] = await Promise.all([
          getWorkforceSummary(params),
          getWorkforceEmployees(params),
          getWorkforceTrends(globalParams),
          getWorkforceAlerts(params),
          getWorkforceOutlets(globalParams)
        ]);
        setSummary(sumRes);
        setEmployees(empRes);
        setTrends(trRes);
        setAlerts(alRes);
        const currentOutlet = outletsRes.find(o => String(o.outlet_id) === String(outletId));
        if (currentOutlet) setOutletName(currentOutlet.outlet_name);
      } catch (err: unknown) {
        setError((err as Error).message || "Unable to load outlet workforce metrics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [outletId, startDate, endDate]);

  const handleDateChange = (preset: DatePreset, start: string, end: string) => {
    setDatePreset(preset);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Layout 
        title="Outlet Workforce" 
        subtitle="Detailed workforce analysis for the selected outlet."
    >
      <button 
        onClick={() => navigate('/workforce')}
        className="flex items-center text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workforce Overview
      </button>

      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-[#fdf3eb] text-[#c89f70] flex items-center justify-center mr-4 border border-[#ece3d4] shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#3d3228] mb-1">
              {outletName}
            </h2>
            <p className="text-sm font-medium text-[#8c7b6c]">Workforce metrics and employee directory</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <WorkforceDateFilter 
            preset={datePreset} 
            startDate={startDate} 
            endDate={endDate} 
            onChange={handleDateChange} 
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin mb-4" />
          <p className="text-[#8c7b6c] font-medium animate-pulse">Loading outlet workforce data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-6">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <WorkforceKPICards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1 h-[320px]">
              <WorkforceHealthOverview summary={summary} />
            </div>
            <div className="lg:col-span-3 h-[320px]">
              <WorkforceTrendsChart data={trends} title="Franchise Workforce Trends" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1 h-[400px]">
              <WorkforceAlerts alerts={alerts} />
            </div>
            <div className="lg:col-span-3">
              <WorkforceEmployeeDirectory employees={employees} />
            </div>
          </div>

          <div className="mb-6">
            <StaffAiPanel 
              context="outlet" 
              outletId={Number(outletId)}
              startDate={startDate} 
              endDate={endDate} 
              title={`Staff Intelligence for ${outletName}`}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
