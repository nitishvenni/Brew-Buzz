import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Loader2, ArrowLeft, User } from 'lucide-react';
import { getWorkforceEmployee } from '../api/workforceApi';
import type { EmployeeWorkforceMetrics } from '../api/workforceApi';
import { WorkforceDateFilter } from '../components/workforce/WorkforceDateFilter';
import type { DatePreset } from '../components/workforce/WorkforceDateFilter';
import { StaffAiPanel } from '../components/workforce/StaffAiPanel';
import { subDays, startOfDay } from 'date-fns';

export function WorkforceEmployeePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 29)).toISOString());
  const [endDate, setEndDate] = useState(startOfDay(new Date()).toISOString());

  const [employee, setEmployee] = useState<EmployeeWorkforceMetrics | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!employeeId) return;
      setLoading(true);
      setError(null);
      try {
        const params = { start_date: startDate, end_date: endDate };
        const data = await getWorkforceEmployee(Number(employeeId), params);
        setEmployee(data);
      } catch (err: unknown) {
        setError((err as Error).message || "Unable to load employee workforce metrics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId, startDate, endDate]);

  const handleDateChange = (preset: DatePreset, start: string, end: string) => {
    setDatePreset(preset);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Layout 
        title="Employee Detail" 
        subtitle="Operational metrics and attendance records."
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-[#fdf3eb] text-[#c89f70] flex items-center justify-center mr-4 border border-[#ece3d4] shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#3d3228] mb-1">
              {employee ? employee.name : 'Employee Detail'}
            </h2>
            <p className="text-sm font-medium text-[#8c7b6c]">
              {employee ? `${employee.role} at ${employee.outlet}` : 'Loading...'}
            </p>
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
          <p className="text-[#8c7b6c] font-medium animate-pulse">Loading employee data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-6">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && employee && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#ece3d4] bg-[#fdfaf6]">
              <h3 className="text-sm font-bold text-[#4a3b2c] uppercase tracking-wider">Shift Metrics</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Scheduled Shifts</span>
                <span className="text-lg font-bold text-[#3d3228]">{employee.scheduled_shifts}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Completed Shifts</span>
                <span className="text-lg font-bold text-[#3d3228]">{employee.completed_shifts}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Absent Shifts</span>
                <span className="text-lg font-bold text-red-600">{employee.absent_shifts}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-[#8c7b6c] font-medium">Late Shifts</span>
                <span className="text-lg font-bold text-amber-600">{employee.late_shifts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#ece3d4] bg-[#fdfaf6]">
              <h3 className="text-sm font-bold text-[#4a3b2c] uppercase tracking-wider">Hours & Rates</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Attendance Rate</span>
                <span className="text-lg font-bold text-emerald-600">{employee.attendance_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Late Rate</span>
                <span className="text-lg font-bold text-amber-600">{employee.late_rate.toFixed(1)}%</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Scheduled Hours</span>
                <span className="text-lg font-bold text-[#3d3228]">{employee.scheduled_hours.toFixed(1)} h</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Actual Hours</span>
                <span className="text-lg font-bold text-[#3d3228]">{employee.actual_hours.toFixed(1)} h</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ece3d4] pb-4">
                <span className="text-[#8c7b6c] font-medium">Avg Hours/Shift</span>
                <span className="text-lg font-bold text-[#3d3228]">{employee.average_hours_per_shift.toFixed(1)} h</span>
              </div>

              <div className="flex justify-between items-center pb-2">
                <span className="text-[#8c7b6c] font-medium">Overtime Hours</span>
                <span className="text-lg font-bold text-amber-600">{employee.overtime_hours.toFixed(1)} h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && employee && (
        <div className="mt-6">
          <StaffAiPanel 
            context="employee" 
            employeeId={Number(employeeId)}
            startDate={startDate} 
            endDate={endDate} 
            title={`Staff Intelligence for ${employee.name}`}
          />
        </div>
      )}
    </Layout>
  );
}
