import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, Coffee, Pizza, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface Props {
  scores: any[];
  products: any[];
  categories: any[];
}

export function OverviewAiInsights({ scores, products, categories }: Props) {
  const navigate = useNavigate();

  const sortedScores = scores ? [...scores].sort((a, b) => b.overall_score - a.overall_score) : [];
  const needsAttention = sortedScores[sortedScores.length - 1];
  const topProduct = products && products.length > 0 ? products[0] : null;
  const topCategory = categories && categories.length > 0 ? [...categories].sort((a, b) => b.revenue - a.revenue)[0] : null;

  return (
    <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#c89f70]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-[#4a3b2c] flex items-center">
          <Lightbulb className="w-5 h-5 text-[#c89f70] mr-2" />
          AI Insights
        </h3>
        <span className="flex items-center text-[10px] font-bold text-[#c89f70] bg-[#fdfaf6] border border-[#ece3d4] px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2 space-y-5 mb-6 divide-y divide-[#ece3d4]/60">
        
        {/* Insight 1: Needs Attention */}
        {needsAttention && (
          <div className="flex items-start pt-2 first:pt-0">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mr-4 shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#4a3b2c] text-sm mb-1">{needsAttention.outlet_name} performance is low</h4>
              <p className="text-sm text-[#8c7b6c] leading-relaxed">
                Score is <span className="font-semibold text-orange-600">{needsAttention.overall_score}/100</span>. 
                {needsAttention.components?.revenue_score < 50 ? " Revenue is below franchise average. " : " "}
                Investigate to see detailed root causes.
              </p>
            </div>
          </div>
        )}

        {/* Insight 2: Top Product */}
        {topProduct && (
          <div className="flex items-start pt-5">
            <div className="w-10 h-10 rounded-full bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mr-4 shrink-0">
              <Coffee className="w-5 h-5 text-[#c89f70]" />
            </div>
            <div>
              <h4 className="font-bold text-[#4a3b2c] text-sm mb-1">{topProduct.product_name} is the top performing product</h4>
              <p className="text-sm text-[#8c7b6c] leading-relaxed">
                {topProduct.growth_percentage > 0 && <span className="text-green-600 font-semibold mr-1">↑ {topProduct.growth_percentage}%</span>} sales growth recently.
              </p>
            </div>
          </div>
        )}

        {/* Insight 3: Top Category */}
        {topCategory && (
          <div className="flex items-start pt-5">
            <div className="w-10 h-10 rounded-full bg-[#fdf3eb] border border-[#e87c48]/20 flex items-center justify-center mr-4 shrink-0">
              <Pizza className="w-5 h-5 text-[#e87c48]" />
            </div>
            <div>
              <h4 className="font-bold text-[#4a3b2c] text-sm mb-1">{topCategory.category_name} is driving highest revenue</h4>
              <p className="text-sm text-[#8c7b6c] leading-relaxed">
                 Generated <span className="font-semibold text-[#4a3b2c]">{formatCurrency(topCategory.revenue)}</span> in this period.
              </p>
            </div>
          </div>
        )}

        {/* Insight 4: Generic Growth */}
        <div className="flex items-start pt-5">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mr-4 shrink-0">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-[#4a3b2c] text-sm mb-1">Growth Opportunity</h4>
            <p className="text-sm text-[#8c7b6c] leading-relaxed">
               AI has detected potential revenue optimization strategies for underperforming outlets.
            </p>
          </div>
        </div>

      </div>

      <button 
        onClick={() => navigate('/outlet-performance')}
        className="w-full bg-[#c89f70] hover:bg-[#b08558] text-white px-4 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-sm relative z-10 border border-[#b08558]"
      >
        <Lightbulb className="w-4 h-4 mr-2" /> Investigate with AI <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
