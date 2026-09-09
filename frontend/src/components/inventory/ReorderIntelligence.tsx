import { Lightbulb, Info } from 'lucide-react';

export function ReorderIntelligence({ detail }: { detail: any }) {
  if (!detail.recommended_reorder_quantity || detail.recommended_reorder_quantity <= 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
        <h3 className="text-sm font-bold text-[#8c7b6c] uppercase tracking-widest mb-4">Reorder Intelligence</h3>
        <p className="text-sm text-[#8c7b6c] italic">No reorder recommended at this time.</p>
      </div>
    );
  }

  // Calculate some breakdown fields if available
  const current = detail.current_quantity || 0;
  const leadTimeCons = (detail.average_daily_consumption || 0) * (detail.supplier_lead_time_days || 0);
  const safety = detail.safety_stock || 0;
  const isUrgent = detail.status === 'CRITICAL' || detail.status === 'LOW';

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-[#ece3d4] bg-[#fdfaf6] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-[#c89f70]" />
          <h3 className="font-bold text-[#4a3b2c]">Reorder Intelligence</h3>
        </div>
        {isUrgent && (
          <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Urgent Action
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col">
        <div className="mb-6">
          <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Recommended Reorder</p>
          <div className="flex items-end">
            <span className="text-4xl font-extrabold text-[#c89f70]">{detail.recommended_reorder_quantity.toFixed(1)}</span>
            <span className="text-lg font-bold text-[#8c7b6c] ml-1 mb-1">{detail.unit}</span>
          </div>
        </div>

        <div className="bg-[#f5f0e6] p-4 rounded-xl border border-[#ece3d4] mb-4 flex-1">
          <h4 className="text-sm font-bold text-[#4a3b2c] mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1.5 text-[#8c7b6c]" />
            Why reorder now?
          </h4>
          <p className="text-xs text-[#8c7b6c] leading-relaxed">
            {isUrgent ? 
              `Current stock (${current.toFixed(1)} ${detail.unit}) will not last until the supplier lead time (${detail.supplier_lead_time_days} days) is completed. Reorder immediately to avoid stockouts.` : 
              `Stock is approaching the reorder threshold. Purchasing now ensures you maintain the required safety buffer.`
            }
          </p>
        </div>

        <div className="border border-[#ece3d4] rounded-xl overflow-hidden">
          <div className="bg-[#fdfaf6] px-4 py-2 border-b border-[#ece3d4]">
            <p className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">Calculation Breakdown</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8c7b6c]">Current Stock</span>
              <span className="font-bold text-[#4a3b2c]">{current.toFixed(1)} {detail.unit}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8c7b6c]">Expected Lead Time Usage</span>
              <span className="font-bold text-orange-600">-{leadTimeCons.toFixed(1)} {detail.unit}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8c7b6c]">Safety Buffer Required</span>
              <span className="font-bold text-[#4a3b2c]">{safety.toFixed(1)} {detail.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
