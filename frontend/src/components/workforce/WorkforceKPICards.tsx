import { Users, UserCheck, Clock, UserRoundX } from 'lucide-react';
import type { WorkforceSummary } from '../../api/workforceApi';

export function WorkforceKPICards({ summary }: { summary: WorkforceSummary }) {
  const kpis = [
    {
      label: 'Total Staff',
      value: summary.total_staff,
      description: `${summary.active_staff} Active, ${summary.inactive_staff} Inactive`,
      icon: Users,
      color: 'text-[#8c7b6c]',
      bg: 'bg-[#fdfaf6]',
      border: 'border-[#ece3d4]'
    },
    {
      label: 'Attendance Rate',
      value: `${summary.attendance_rate.toFixed(1)}%`,
      description: 'Based on scheduled shifts',
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Actual Hours',
      value: `${summary.actual_hours.toFixed(1)} h`,
      description: 'Completed working hours',
      icon: Clock,
      color: 'text-[#c89f70]',
      bg: 'bg-[#fdf3eb]',
      border: 'border-[#ece3d4]'
    },
    {
      label: 'Overtime Hours',
      value: `${summary.overtime_hours.toFixed(1)} h`,
      description: 'Hours above scheduled shifts',
      icon: UserRoundX,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.border} ${kpi.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#8c7b6c] mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-black text-[#3d3228] leading-tight mb-1">{kpi.value}</h3>
              <p className="text-xs text-[#bbaaa0] font-medium">{kpi.description}</p>
            </div>
          </div>
        );
      })}

    </div>
    <div className="bg-white border border-[#ece3d4] rounded-xl p-4 flex flex-wrap gap-8 items-center shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Scheduled Hours</span>
        <span className="text-sm font-black text-[#4a3b2c]">{summary.scheduled_hours.toFixed(1)} h</span>
      </div>
      <div className="w-px h-8 bg-[#ece3d4] hidden sm:block"></div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Absence Rate</span>
        <span className="text-sm font-black text-red-600">{summary.absence_rate.toFixed(1)}%</span>
      </div>
      <div className="w-px h-8 bg-[#ece3d4] hidden sm:block"></div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Orders / Staff Hour</span>
        <span className="text-sm font-black text-[#4a3b2c]">{summary.orders_per_staff_hour.toFixed(1)}</span>
      </div>

    </div>
    <div className="bg-white border border-[#ece3d4] rounded-xl p-4 flex flex-wrap gap-8 items-center shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Scheduled Hours</span>
        <span className="text-sm font-black text-[#4a3b2c]">{summary.scheduled_hours.toFixed(1)} h</span>
      </div>
      <div className="w-px h-8 bg-[#ece3d4] hidden sm:block"></div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Absence Rate</span>
        <span className="text-sm font-black text-red-600">{summary.absence_rate.toFixed(1)}%</span>
      </div>
      <div className="w-px h-8 bg-[#ece3d4] hidden sm:block"></div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#8c7b6c] uppercase">Orders / Staff Hour</span>
        <span className="text-sm font-black text-[#4a3b2c]">{summary.orders_per_staff_hour.toFixed(1)}</span>
      </div>
    </div>
    </div>
  );
}
