import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Filter } from 'lucide-react';

export function InventoryItemsTable({ items }: { items: any[] }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col">
      <div className="p-5 border-b border-[#ece3d4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-t-2xl">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Inventory Directory</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c7b6c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ingredient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-xl text-sm focus:outline-none focus:border-[#c89f70] w-64 transition-colors focus:bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-[#8c7b6c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-xl text-sm text-[#4a3b2c] font-medium focus:outline-none focus:border-[#c89f70] appearance-none cursor-pointer hover:bg-[#f5f0e6] transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical</option>
              <option value="LOW">Low Stock</option>
              <option value="WATCH">Watch</option>
              <option value="HEALTHY">Healthy</option>
              <option value="OVERSTOCK">Overstock</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#4a3b2c]">
          <thead className="bg-[#fdfaf6] text-[10px] uppercase text-[#8c7b6c] font-extrabold border-b border-[#ece3d4] tracking-wider">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Ingredient</th>
              <th className="px-6 py-4 whitespace-nowrap">Current Stock</th>
              <th className="px-6 py-4 whitespace-nowrap">Daily Usage</th>
              <th className="px-6 py-4 whitespace-nowrap">Days Rem.</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50 bg-white">
            {filteredItems.map(item => (
              <tr 
                key={item.inventory_item_id} 
                onClick={() => navigate(`/inventory/${item.inventory_item_id}`)}
                className="hover:bg-[#fdfaf6] transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <p className="font-bold text-[#4a3b2c]">{item.ingredient_name}</p>
                  <p className="text-xs text-[#8c7b6c]">{item.outlet_name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-[#4a3b2c]">{item.current_quantity}</span>
                  <span className="text-xs text-[#8c7b6c] ml-1">{item.unit}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-[#4a3b2c]">{item.average_daily_consumption}</span>
                  <span className="text-xs text-[#8c7b6c] ml-1">{item.unit}/day</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">{item.days_remaining !== null ? item.days_remaining : '^z'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    item.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                    item.status === 'LOW' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    item.status === 'WATCH' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    item.status === 'HEALTHY' ? 'bg-green-50 text-green-700 border-green-100' : 
                    'bg-purple-50 text-purple-700 border-purple-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#c89f70] group-hover:text-[#b08558] font-bold flex items-center justify-end w-full transition-colors text-xs uppercase tracking-wider">
                    View <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#8c7b6c]">
                  <p className="font-medium">No inventory items match your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
