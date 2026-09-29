import { useNavigate } from 'react-router-dom';
import type { OutletWorkforceMetrics } from '../../api/workforceApi';

export function WorkforceOutletTable({ outlets }: { outlets: OutletWorkforceMetrics[] }) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-700 bg-green-50 border-green-200';
      case 'WATCH': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'ATTENTION': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#ece3d4] bg-[#fdfaf6]">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Outlet Workforce Overview</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fcf9f2] text-left text-[#8c7b6c] uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Outlet</th>
              <th className="px-6 py-4 font-bold">Health</th>
              <th className="px-6 py-4 font-bold text-right">Active Staff</th>
              <th className="px-6 py-4 font-bold text-right">Attendance</th>
              <th className="px-6 py-4 font-bold text-right">Absence</th>
              <th className="px-6 py-4 font-bold text-right">Late</th>
              <th className="px-6 py-4 font-bold text-right">Overtime</th>
              <th className="px-6 py-4 font-bold text-right">Orders/Hr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]">
            {outlets.map((outlet, idx) => (
              <tr 
                key={idx} 
                onClick={() => navigate(`/workforce/outlet/${outlet.outlet_id}`)}
                className="hover:bg-[#fdfaf6] cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-[#4a3b2c] group-hover:text-[#c89f70] transition-colors">
                    {outlet.outlet_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(outlet.status)}`}>
                    {outlet.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-[#4a3b2c]">{outlet.active_staff}</td>
                <td className="px-6 py-4 text-right font-medium text-emerald-600">{outlet.attendance_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right font-medium text-red-500">{outlet.absence_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right font-medium text-amber-500">{outlet.late_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right font-medium text-[#8c7b6c]">{outlet.overtime_hours.toFixed(1)} h</td>
                <td className="px-6 py-4 text-right font-medium text-[#4a3b2c]">{outlet.orders_per_staff_hour.toFixed(1)}</td>
              </tr>
            ))}
            {outlets.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#8c7b6c] font-medium">
                  No outlet workforce data available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
