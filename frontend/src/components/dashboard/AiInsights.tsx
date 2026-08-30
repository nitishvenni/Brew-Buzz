import { useState } from 'react';
import { Lightbulb, AlertTriangle, ArrowRight, Loader2, Target } from 'lucide-react';
import { investigateOutlet } from '../../api/client';

export function AiInsights({ selectedOutlet, scores, startDate, endDate }: any) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<any>(null);
  const [error, setError] = useState("");

  const activeOutlet = scores?.find((s: any) => s.outlet_id === selectedOutlet);

  const handleInvestigate = async () => {
    if (!selectedOutlet) return;
    setLoading(true);
    setError("");
    setInsight(null);
    try {
      const result = await investigateOutlet(selectedOutlet, startDate, endDate);
      setInsight(result);
    } catch (err) {
      setError("Failed to generate AI insights.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedOutlet || !activeOutlet) {
    return (
      <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#4a3b2c] flex items-center">
            <Lightbulb className="w-5 h-5 text-[#c89f70] mr-2" />
            AI Insights
          </h3>
          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
            Live
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
          <Target className="w-12 h-12 text-[#c89f70] mb-3 opacity-50" />
          <p className="text-[#8c7b6c] max-w-[200px]">Select an outlet from the performance list to run an AI investigation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#ece3d4] shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c89f70]/5 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-[#4a3b2c] flex items-center">
          <Lightbulb className="w-5 h-5 text-[#c89f70] mr-2" />
          AI Insights
        </h3>
        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 space-y-4">
        {!insight && !loading && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ece3d4]/50">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-[#4a3b2c] mb-1">{activeOutlet.outlet_name} ready for analysis</h4>
                <p className="text-sm text-[#8c7b6c] mb-3">
                  Score: {activeOutlet.overall_score}/100. 
                  {activeOutlet.weaknesses?.length > 0 
                    ? ` Trigger detected: ${activeOutlet.weaknesses[0]}.` 
                    : " Analyzing patterns."}
                </p>
                <button 
                  onClick={handleInvestigate}
                  className="bg-[#c89f70] hover:bg-[#b08558] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                >
                  Investigate with AI <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Loader2 className="w-8 h-8 text-[#c89f70] animate-spin" />
            <p className="text-[#8c7b6c] font-medium animate-pulse">Brew Buzz Agent reasoning...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {insight && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ece3d4]">
              <h4 className="font-bold text-[#4a3b2c] mb-2 border-b border-[#ece3d4]/50 pb-2">AI Summary</h4>
              <p className="text-sm text-[#5c4d3c] leading-relaxed">{insight.summary}</p>
            </div>
            
            {insight.findings?.map((f: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-[#ece3d4] flex items-start">
                 <div className="w-6 h-6 rounded-full bg-[#fdf3eb] flex items-center justify-center mr-3 shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#d48c48]"></span>
                 </div>
                 <div>
                   <h5 className="font-bold text-[#4a3b2c] text-sm">{f.finding_type}</h5>
                   <p className="text-sm text-[#8c7b6c] mt-1">{f.statement}</p>
                 </div>
              </div>
            ))}
            
            {insight.recommendations?.length > 0 && (
              <div className="bg-[#fdfaf6] p-4 rounded-xl border border-[#ece3d4]">
                <h4 className="font-bold text-[#4a3b2c] mb-2 text-sm">Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {insight.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-[#8c7b6c]">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
