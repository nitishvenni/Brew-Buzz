
import { ArrowUpRight, ArrowDownRight, Store } from 'lucide-react';
import { cn } from '../../lib/utils';

export function OutletPerformanceList({ scores, onSelect }: { scores: any[], onSelect: (id: number) => void }) {
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#ece3d4] flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#4a3b2c]">Outlet Performance</h3>
        <button className="text-[#c89f70] text-sm font-medium flex items-center hover:text-[#b08558]">
          View all <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-[#fdfaf6] sticky top-0 z-10">
            <tr>
              <th className="text-left text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Outlet</th>
              <th className="text-right text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Trend</th>
              <th className="text-right text-xs font-medium text-[#8c7b6c] uppercase tracking-wider px-6 py-3 border-b border-[#ece3d4]">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece3d4]/50">
            {scores?.map((outlet: any) => (
              <tr 
                key={outlet.outlet_id} 
                onClick={() => onSelect(outlet.outlet_id)}
                className="hover:bg-[#fdfaf6] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#f3ede4] flex items-center justify-center text-[#8c7b6c] mr-3">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#4a3b2c]">{outlet.outlet_name}</p>
                      <p className="text-xs text-[#8c7b6c] truncate max-w-[120px]">
                        {outlet.performance_band}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end">
                    {outlet.growth_percentage > 0 ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> {outlet.growth_percentage}%
                      </span>
                    ) : outlet.growth_percentage < 0 ? (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <ArrowDownRight className="w-4 h-4 mr-1" /> {Math.abs(outlet.growth_percentage)}%
                      </span>
                    ) : (
                      <span className="text-[#8c7b6c] text-sm font-medium">0%</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm", getScoreColor(outlet.overall_score))}>
                    {outlet.overall_score}
                  </span>
                </td>
              </tr>
            ))}
            {(!scores || scores.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[#8c7b6c]">No outlets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
