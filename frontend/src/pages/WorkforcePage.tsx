import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { 
  getWorkforceSummary, 
  getWorkforceOutlets, 
  getWorkforceEmployees, 
  getWorkforceTrends, 
  getWorkforceAlerts
} from '../api/workforceApi';
import type { WorkforceSummary, OutletWorkforceMetrics, EmployeeWorkforceMetrics, WorkforceTrend, WorkforceAlert } from '../api/workforceApi';
import { WorkforceDateFilter } from '../components/workforce/WorkforceDateFilter';
import type { DatePreset } from '../components/workforce/WorkforceDateFilter';
import { WorkforceKPICards } from '../components/workforce/WorkforceKPICards';
import { WorkforceHealthOverview } from '../components/workforce/WorkforceHealthOverview';
import { WorkforceTrendsChart } from '../components/workforce/WorkforceTrendsChart';
import { WorkforceAlerts } from '../components/workforce/WorkforceAlerts';
import { WorkforceOutletTable } from '../components/workforce/WorkforceOutletTable';
import { WorkforceEmployeeDirectory } from '../components/workforce/WorkforceEmployeeDirectory';
import { StaffAiPanel } from '../components/workforce/StaffAiPanel';
import { subDays, startOfDay } from 'date-fns';

export function WorkforcePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 29)).toISOString());
  const [endDate, setEndDate] = useState(startOfDay(new Date()).toISOString());

  const [summary, setSummary] = useState<WorkforceSummary | null>(null);
  const [outlets, setOutlets] = useState<OutletWorkforceMetrics[]>([]);
  const [employees, setEmployees] = useState<EmployeeWorkforceMetrics[]>([]);
  const [trends, setTrends] = useState<WorkforceTrend[]>([]);
  const [alerts, setAlerts] = useState<WorkforceAlert[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const params = { start_date: startDate, end_date: endDate };
        const [sumRes, outRes, empRes, trRes, alRes] = await Promise.all([
          getWorkforceSummary(params),
          getWorkforceOutlets(params),
          getWorkforceEmployees(params),
          getWorkforceTrends(params),
          getWorkforceAlerts(params)
        ]);
        setSummary(sumRes);
        setOutlets(outRes);
        setEmployees(empRes);
        setTrends(trRes);
        setAlerts(alRes);
      } catch (err: unknown) {
        setError((err as Error).message || "Unable to load workforce metrics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [startDate, endDate]);

  const handleDateChange = (preset: DatePreset, start: string, end: string) => {
    setDatePreset(preset);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Layout 
        title="Workforce Intelligence" 
        subtitle="Monitor operational staffing, attendance trends, and workload density across your franchise."
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#3d3228]">Workforce Overview</h2>
        <WorkforceDateFilter 
          preset={datePreset} 
          startDate={startDate} 
          endDate={endDate} 
          onChange={handleDateChange} 
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin mb-4" />
          <p className="text-[#8c7b6c] font-medium animate-pulse">Loading workforce data...</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 h-[320px]">
              <WorkforceHealthOverview summary={summary} />
            </div>
            <div className="lg:col-span-2 h-[320px]">
              <WorkforceTrendsChart data={trends} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1 h-[400px]">
              <WorkforceAlerts alerts={alerts} />
            </div>
            <div className="lg:col-span-3">
              <WorkforceOutletTable outlets={outlets} />
            </div>
          </div>

          <div className="mb-6">
            <WorkforceEmployeeDirectory employees={employees} />
          </div>

          <div className="mb-6">
            <StaffAiPanel 
              context="franchise" 
              startDate={startDate} 
              endDate={endDate} 
            />
          </div>
        </>
      )}
    </Layout>
  );
}
