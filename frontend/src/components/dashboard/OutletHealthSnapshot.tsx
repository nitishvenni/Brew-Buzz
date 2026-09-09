import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OutletHealthSnapshotProps {
  scores: any[];
  avgScore: number;
}

export function OutletHealthSnapshot({ scores, avgScore }: OutletHealthSnapshotProps) {
  const navigate = useNavigate();

  const sorted = scores ? [...scores].sort((a, b) => b.overall_score - a.overall_score) : [];
  const best = sorted[0];
  const needsAttention = sorted[sorted.length - 1];

  const getBandColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#4a3b2c] flex items-center">
          <Activity className="w-5 h-5 text-[#c89f70] mr-2" />
          Outlet Health Overview
        </h3>
        <button
          onClick={() => navigate('/outlet-performance')}
          className="bg-[#fdfaf6] border border-[#ece3d4] hover:bg-[#c89f70] hover:text-white hover:border-[#c89f70] text-[#4a3b2c] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm"
        >
          View Outlet Performance <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Franchise Average */}
        <div className="bg-[#fdfaf6] rounded-xl p-5 border border-[#ece3d4] flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bbaaa0] uppercase tracking-wider mb-2">Franchise Average</p>
          <p className="text-4xl font-extrabold text-[#4a3b2c] tracking-tight">{avgScore}<span className="text-xl text-[#8c7b6c] font-bold"> / 100</span></p>
        </div>

        {/* Best Performing */}
        {best && (
          <div className="bg-[#fdfaf6] rounded-xl p-5 border border-[#ece3d4] flex flex-col justify-between">
            <p className="text-[11px] font-bold text-[#bbaaa0] uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1.5 text-green-500" /> Best Performing
            </p>
            <div>
              <p className="font-bold text-[#4a3b2c] text-lg truncate mb-2">{best.outlet_name}</p>
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border", getBandColor(best.overall_score))}>
                {best.overall_score} — {best.performance_band}
              </span>
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {needsAttention && needsAttention !== best && (
          <div className="bg-[#fdfaf6] rounded-xl p-5 border border-[#ece3d4] flex flex-col justify-between">
            <p className="text-[11px] font-bold text-[#bbaaa0] uppercase tracking-wider mb-2 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1.5 text-orange-500" /> Needs Attention
            </p>
            <div>
              <p className="font-bold text-[#4a3b2c] text-lg truncate mb-2">{needsAttention.outlet_name}</p>
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border", getBandColor(needsAttention.overall_score))}>
                {needsAttention.overall_score} — {needsAttention.performance_band}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
