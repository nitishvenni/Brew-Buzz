import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { EmployeeWorkforceMetrics } from '../../api/workforceApi';

export function WorkforceEmployeeDirectory({ employees }: { employees: EmployeeWorkforceMetrics[] }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');

  const uniqueOutlets = useMemo(() => Array.from(new Set(employees.map(e => e.outlet))).sort(), [employees]);
  const uniqueRoles = useMemo(() => Array.from(new Set(employees.map(e => e.role))).sort(), [employees]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchOutlet = filterOutlet === 'ALL' || e.outlet === filterOutlet;
      const matchRole = filterRole === 'ALL' || e.role === filterRole;
      
      return matchSearch && matchOutlet && matchRole;
    });
  }, [employees, searchTerm, filterOutlet, filterRole]);

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#ece3d4] bg-[#fdfaf6]">
        <h3 className="text-lg font-bold text-[#4a3b2c] mb-4">Employee Directory</h3>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8c7b6c]" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#ece3d4] rounded-lg text-sm focus:outline-none focus:border-[#c89f70]"
            />
          </div>
          <div className="flex space-x-3">
            <select 
              value={filterOutlet} 
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="px-3 py-2 bg-white border border-[#ece3d4] rounded-lg text-sm text-[#4a3b2c] focus:outline-none focus:border-[#c89f70]"
            >
              <option value="ALL">All Outlets</option>
              {uniqueOutlets.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-white border border-[#ece3d4] rounded-lg text-sm text-[#4a3b2c] focus:outline-none focus:border-[#c89f70]"
            >
              <option value="ALL">All Roles</option>
              {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fcf9f2] text-left text-[#8c7b6c] uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Employee</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Outlet</th>
              <th className="px-6 py-4 font-bold text-right">Shifts</th>
              <th className="px-6 py-4 font-bold text-right">Attendance</th>
              <th className="px-6 py-4 font-bold text-right">Late Rate</th>
              <th className="px-6 py-4 font-bold text-right">Actual Hours</th>
              <th className="px-6 py-4 font-bold text-right">Overtime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]">
            {filtered.map((emp) => (
              <tr 
                key={emp.employee_id} 
                onClick={() => navigate(`/workforce/employee/${emp.employee_id}`)}
                className="hover:bg-[#fdfaf6] cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-[#4a3b2c] group-hover:text-[#c89f70] transition-colors">{emp.name}</div>
                  <div className="text-xs text-[#8c7b6c]">{emp.employee_code}</div>
                </td>
                <td className="px-6 py-4 font-medium text-[#4a3b2c]">{emp.role}</td>
                <td className="px-6 py-4 font-medium text-[#8c7b6c]">{emp.outlet}</td>
                <td className="px-6 py-4 text-right font-medium text-[#4a3b2c]">
                  {emp.completed_shifts} <span className="text-xs text-[#bbaaa0]">/ {emp.scheduled_shifts}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-emerald-600">{emp.attendance_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right font-medium text-amber-500">{emp.late_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right font-medium text-[#4a3b2c]">{emp.actual_hours.toFixed(1)} h</td>
                <td className="px-6 py-4 text-right font-medium text-red-500">{emp.overtime_hours.toFixed(1)} h</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#8c7b6c] font-medium">
                  No employees match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
