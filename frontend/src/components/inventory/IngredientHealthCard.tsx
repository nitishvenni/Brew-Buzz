import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function IngredientHealthCard({ detail }: { detail: any }) {
  const daysRem = detail.days_remaining !== null ? detail.days_remaining : 999;
  const leadTime = detail.supplier_lead_time_days || 0;
  
  const isDanger = daysRem < leadTime;
  const diff = leadTime - daysRem;

  // For visualization scale, we'll make the max value either 30 days or double the lead time, whichever is bigger
  const maxScale = Math.max(30, leadTime * 2);
  const remainingPercent = Math.min(100, Math.max(0, (daysRem / maxScale) * 100));
  const leadTimePercent = Math.min(100, Math.max(0, (leadTime / maxScale) * 100));

  const statusColor = 
    detail.status === 'CRITICAL' ? 'text-red-600 bg-red-100 border-red-200' :
    detail.status === 'LOW' ? 'text-orange-600 bg-orange-100 border-orange-200' :
    detail.status === 'WATCH' ? 'text-amber-600 bg-amber-100 border-amber-200' :
    detail.status === 'HEALTHY' ? 'text-green-600 bg-green-100 border-green-200' : 
    'text-purple-600 bg-purple-100 border-purple-200';

  const barColor = 
    detail.status === 'CRITICAL' ? 'bg-red-500' :
    detail.status === 'LOW' ? 'bg-orange-500' :
    detail.status === 'WATCH' ? 'bg-amber-500' :
    detail.status === 'HEALTHY' ? 'bg-green-500' : 'bg-purple-500';

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-[#8c7b6c] uppercase tracking-widest">Stock Risk Visualization</h3>
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
          {detail.status}
        </span>
      </div>
      
      {/* Risk Visualization Bar */}
      <div className="relative mb-12 mt-6 px-3">
        {/* Background Track */}
        <div className="w-full bg-[#f5f0e6] h-6 rounded-full relative">
          
          {/* Active Days Remaining Fill */}
          {detail.days_remaining !== null && (
            <div 
              className={`absolute top-0 left-0 h-full rounded-full ${barColor} shadow-sm z-10 transition-all duration-500`}
              style={{ width: `${remainingPercent}%` }}
            >
              {/* Tooltip dot at end of fill */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-white border-[3px] border-current rounded-full shadow z-20" style={{ borderColor: 'inherit', color: detail.status === 'HEALTHY' ? '#22c55e' : detail.status === 'CRITICAL' ? '#ef4444' : '#f59e0b' }}></div>
              <div className="absolute -top-8 right-0 translate-x-1/2 whitespace-nowrap text-sm font-bold text-[#4a3b2c]">
                {daysRem} days rem.
              </div>
            </div>
          )}

          {/* Lead Time Marker */}
          {leadTime > 0 && (
            <div 
              className="absolute top-0 bottom-0 w-1 bg-[#4a3b2c] z-20"
              style={{ left: `${leadTimePercent}%` }}
            >
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-[#8c7b6c] uppercase">
                Supplier Delivery ({leadTime}d)
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#4a3b2c]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment Text */}
      <div className={`p-4 rounded-xl border ${isDanger ? 'bg-red-50 border-red-100 text-red-800' : detail.status === 'OVERSTOCK' ? 'bg-purple-50 border-purple-100 text-purple-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
        <h4 className="text-sm font-bold flex items-center mb-1">
          {isDanger ? <AlertTriangle className="w-4 h-4 mr-2" /> : detail.status === 'OVERSTOCK' ? <Info className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Risk Assessment
        </h4>
        <p className="text-sm leading-relaxed opacity-90">
          {isDanger ? (
            <>Stock is expected to run out approximately <strong>{diff.toFixed(1)} days</strong> before the next supplier delivery can arrive. Reorder immediately.</>
          ) : detail.status === 'OVERSTOCK' ? (
            <>You have significantly more stock than needed for the next 30 days. Capital is tied up unnecessarily.</>
          ) : (
            <>Current stock levels are sufficient to cover the {leadTime} day supplier lead time. No immediate risk of stockout.</>
          )}
        </p>
      </div>
    </div>
  );
}
