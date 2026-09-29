import type { MarketingSummary } from '../../api/marketingApi';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingBag, Receipt } from 'lucide-react';

interface MarketingKPICardsProps {
  summary: MarketingSummary;
  loading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function GrowthIndicator({ growth }: { growth: number | null }) {
  if (growth === null) return <span className="text-[#8c7b6c] text-sm flex items-center"><Minus className="w-4 h-4 mr-1" /> N/A</span>;
  if (growth === 0) return <span className="text-[#8c7b6c] text-sm flex items-center"><Minus className="w-4 h-4 mr-1" /> 0%</span>;
  
  if (growth > 0) {
    return (
      <span className="text-emerald-600 text-sm font-bold flex items-center">
        <TrendingUp className="w-4 h-4 mr-1" />
        +{growth.toFixed(1)}%
      </span>
    );
  }
  
  return (
    <span className="text-rose-600 text-sm font-bold flex items-center">
      <TrendingDown className="w-4 h-4 mr-1" />
      {growth.toFixed(1)}%
    </span>
  );
}

export function MarketingKPICards({ summary, loading }: MarketingKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col justify-between group hover:border-[#c89f70] transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-bold text-[#8c7b6c] uppercase tracking-wider">Revenue</h3>
          <div className="p-2 bg-[#fdfaf6] rounded-lg text-[#c89f70] group-hover:bg-[#c89f70] group-hover:text-white transition-colors">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-[#4a3b2c] mb-1">{formatCurrency(summary.revenue)}</div>
          <div className="flex items-center text-sm mt-2">
            <GrowthIndicator growth={summary.revenue_growth_pct} />
            <span className="text-[#8c7b6c] ml-2 font-medium">vs prev. period</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col justify-between group hover:border-[#c89f70] transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-bold text-[#8c7b6c] uppercase tracking-wider">Orders</h3>
          <div className="p-2 bg-[#fdfaf6] rounded-lg text-[#c89f70] group-hover:bg-[#c89f70] group-hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-[#4a3b2c] mb-1">{formatNumber(summary.orders)}</div>
          <div className="flex items-center text-sm mt-2">
            <GrowthIndicator growth={summary.order_growth_pct} />
            <span className="text-[#8c7b6c] ml-2 font-medium">vs prev. period</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm flex flex-col justify-between group hover:border-[#c89f70] transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-bold text-[#8c7b6c] uppercase tracking-wider">Avg Order Value</h3>
          <div className="p-2 bg-[#fdfaf6] rounded-lg text-[#c89f70] group-hover:bg-[#c89f70] group-hover:text-white transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-[#4a3b2c] mb-1">{formatCurrency(summary.aov)}</div>
          <div className="flex items-center text-sm mt-2">
            <GrowthIndicator growth={summary.aov_growth_pct} />
            <span className="text-[#8c7b6c] ml-2 font-medium">vs prev. period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
