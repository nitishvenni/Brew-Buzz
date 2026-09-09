import { ArrowDownRight, ArrowUpRight, AlertTriangle, Edit3 } from 'lucide-react';

export function InventoryHistory({ history, unit }: { history: any[], unit: string }) {
  // Show up to 10 latest transactions for the table
  const recentHistory = history.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-[#ece3d4] bg-white">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Transaction Audit Log</h3>
        <p className="text-sm text-[#8c7b6c] mt-1">Recent inventory movements and adjustments</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#4a3b2c]">
          <thead className="bg-[#fdfaf6] text-[10px] uppercase text-[#8c7b6c] font-extrabold border-b border-[#ece3d4] tracking-wider">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
              <th className="px-6 py-4 whitespace-nowrap">Transaction Type</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Quantity Change</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {recentHistory.map((tx) => {
              const isNegative = parseFloat(tx.quantity) < 0;
              const absQuantity = Math.abs(parseFloat(tx.quantity));
              
              let typeConfig = { bg: 'bg-gray-100', text: 'text-gray-700', icon: Edit3, label: 'Adjustment', fallbackRef: 'Stock Adjustment' };
              if (tx.transaction_type === 'CONSUMPTION') typeConfig = { bg: 'bg-red-50', text: 'text-red-700', icon: ArrowDownRight, label: 'Consumption', fallbackRef: 'Daily Consumption' };
              else if (tx.transaction_type === 'PURCHASE') typeConfig = { bg: 'bg-green-50', text: 'text-green-700', icon: ArrowUpRight, label: 'Purchase', fallbackRef: 'Supplier Restock' };
              else if (tx.transaction_type === 'WASTAGE') typeConfig = { bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertTriangle, label: 'Wastage', fallbackRef: 'Inventory Waste' };

              const Icon = typeConfig.icon;
              const displayRef = tx.reference || typeConfig.fallbackRef;

              return (
                <tr key={tx.id} className="hover:bg-[#fdfaf6] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-[#8c7b6c]">
                    {new Date(tx.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${typeConfig.bg} ${typeConfig.text}`}>
                      <Icon className="w-3 h-3 mr-1.5" />
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      {isNegative ? '-' : '+'}{absQuantity} {unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-xs font-medium text-[#8c7b6c]">
                    {displayRef}
                  </td>
                </tr>
              );
            })}
            {recentHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#8c7b6c]">
                  <p className="font-medium">No transaction history recorded yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
