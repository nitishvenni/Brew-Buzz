import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { fetchOutletScores, fetchSummary, investigateOutlet } from '../api/client';
import { Loader2, ArrowLeft, Store, MapPin, ChevronDown, CheckCircle2, AlertTriangle, BrainCircuit, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const START_DATE = "2026-06-01T00:00:00Z";
const END_DATE = "2026-08-30T00:00:00Z";

const getBandColor = (band: string) => {
  switch (band) {
    case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
    case 'Strong': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Watch': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Needs Attention': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreBarBg = (score: number) => {
  if (score >= 90) return 'bg-green-100';
  if (score >= 75) return 'bg-emerald-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
};

export function OutletDetailPage() {
  const { outletId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // AI Investigation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [scoresData, summaryData] = await Promise.all([
          fetchOutletScores(START_DATE, END_DATE),
          fetchSummary(START_DATE, END_DATE)
        ]);
        setScores(scoresData.outlet_scores || []);
        setSummary(summaryData);
      } catch (err: any) {
        setError(err.message || "Failed to load outlet details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const outlet = scores.find((s: any) => String(s.outlet_id) === outletId);
  const numScores = scores?.length || 1;
  const franchiseAvgRevenue = summary ? summary.revenue / numScores : 0;
  const franchiseAvgOrders = summary ? summary.order_count / numScores : 0;
  const franchiseAvgAov = summary ? summary.aov : 0;

  const handleInvestigate = async () => {
    if (!outlet) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const result = await investigateOutlet(outlet.outlet_id, START_DATE, END_DATE);
      setAiResult(result);
    } catch {
      setAiError("Failed to generate AI insights. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin mb-4" />
        </div>
      </Layout>
    );
  }

  if (error || !outlet) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h3 className="text-xl font-bold mb-2">Outlet Not Found</h3>
          <button onClick={() => navigate('/outlet-performance')} className="text-sm font-bold underline">Back to Outlet Performance</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Outlet Detail" subtitle="In-depth analysis of outlet performance.">
      {/* Top Header & Back Button */}
      <button 
        onClick={() => navigate('/outlet-performance')}
        className="flex items-center text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Outlet Performance
      </button>

      <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-[#fdf3eb] text-[#c89f70] flex items-center justify-center mr-4 border border-[#ece3d4] shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#4a3b2c] tracking-tight">{outlet.outlet_name}</h2>
            <p className="text-sm text-[#8c7b6c] flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" /> Location Area
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center border border-[#ece3d4] bg-[#fdfaf6] rounded-xl px-4 py-2 cursor-pointer hover:border-[#c89f70] transition-all">
          <span className="text-sm font-bold text-[#4a3b2c] mr-2">{outlet.outlet_name}</span>
          <ChevronDown className="w-4 h-4 text-[#8c7b6c]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-8 border-b border-[#ece3d4] mb-6 overflow-x-auto custom-scrollbar">
        <button className="pb-3 text-sm font-bold text-[#e87c48] border-b-2 border-[#e87c48]">Performance Overview</button>
        <button className="pb-3 text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c]">Trends</button>
        <button className="pb-3 text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c]">Comparison</button>
        <button className="pb-3 text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c]">Menu Insights</button>
      </div>

      {/* Overview Content */}
      <div className="bg-white rounded-2xl p-8 border border-[#ece3d4] shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Overall Health Score Card */}
          <div className="bg-[#fcf9f2] rounded-xl p-6 border border-[#ece3d4] flex flex-col items-center justify-center text-center lg:col-span-1">
            <p className="text-sm font-bold text-[#8c7b6c] mb-2">Overall Health Score</p>
            <p className="text-5xl font-extrabold text-[#4a3b2c] mb-1">{outlet.overall_score}<span className="text-2xl text-[#8c7b6c] font-bold"> / 100</span></p>
            <span className={cn("inline-flex px-3 py-1 rounded-md text-xs font-bold border mt-2", getBandColor(outlet.performance_band))}>
              {outlet.performance_band} Performance
            </span>
          </div>

          {/* Component Scores */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            <ScoreBar label="Revenue Score" score={outlet.components?.revenue_score} />
            <ScoreBar label="Orders Score" score={outlet.components?.orders_score} />
            <ScoreBar label="AOV Score" score={outlet.components?.aov_score} />
            <ScoreBar label="Growth Score" score={outlet.components?.growth_score} />
            <ScoreBar label="Benchmark Score" score={outlet.components?.benchmark_score} />
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses, vs Franchise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm">
          <h4 className="text-base font-bold text-[#4a3b2c] mb-4">Strengths</h4>
          <div className="space-y-3">
            {outlet.strengths?.length > 0 ? outlet.strengths.map((s: string, i: number) => (
              <div key={i} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <p className="text-sm text-[#4a3b2c] font-medium">{s}</p>
              </div>
            )) : <p className="text-sm text-[#8c7b6c]">No clear strengths identified.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm">
          <h4 className="text-base font-bold text-[#4a3b2c] mb-4">Weaknesses</h4>
          <div className="space-y-3">
            {outlet.weaknesses?.length > 0 ? outlet.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                <p className="text-sm text-[#4a3b2c] font-medium">{w}</p>
              </div>
            )) : <p className="text-sm text-[#8c7b6c]">No clear weaknesses identified.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ece3d4] shadow-sm">
          <h4 className="text-base font-bold text-[#4a3b2c] mb-4">Key Metrics vs Franchise Average</h4>
          <div className="space-y-4">
            <ComparisonRow label="Revenue" val={outlet.revenue} avg={franchiseAvgRevenue} />
            <ComparisonRow label="Orders" val={outlet.order_count} avg={franchiseAvgOrders} />
            <ComparisonRow label="AOV" val={outlet.aov} avg={franchiseAvgAov} />
            <div className="flex justify-between items-center py-1 border-b border-[#ece3d4]/50 last:border-0">
              <span className="text-sm font-medium text-[#8c7b6c]">Growth</span>
              <span className={cn("text-sm font-bold", outlet.growth_percentage >= 0 ? "text-green-600" : "text-red-600")}>
                {Number.isFinite(outlet.growth_percentage) 
                  ? (outlet.growth_percentage > 0 ? `+${outlet.growth_percentage.toFixed(1)}%` : `${outlet.growth_percentage.toFixed(1)}%`)
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Investigation */}
      <div className="bg-[#fcf9f2] rounded-2xl p-8 border border-[#ece3d4] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c89f70]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <BrainCircuit className="w-6 h-6 text-[#c89f70] mr-2" />
            <h3 className="text-xl font-extrabold text-[#4a3b2c]">AI Outlet Investigation</h3>
          </div>

          {!aiResult && !aiLoading && (
            <div className="max-w-xl">
              <p className="text-sm text-[#8c7b6c] mb-6 leading-relaxed">
                Run an AI-powered deep investigation of <strong>{outlet.outlet_name}</strong>. The agent will analyze product performance, historical orders, and inventory data to identify root causes of weaknesses and provide actionable recommendations.
              </p>
              <button
                onClick={handleInvestigate}
                className="bg-[#c89f70] hover:bg-[#b08558] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center"
              >
                <BrainCircuit className="w-5 h-5 mr-2" /> Investigate with AI →
              </button>
            </div>
          )}

          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin" />
              <p className="text-[#8c7b6c] font-bold animate-pulse">Brew Buzz AI is analyzing outlet data...</p>
            </div>
          )}

          {aiError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="space-y-6">
              {aiResult.summary && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ece3d4]">
                  <h4 className="font-bold text-[#4a3b2c] mb-3 border-b border-[#ece3d4]/50 pb-2">Executive Summary</h4>
                  <p className="text-sm text-[#5c4d3c] leading-relaxed">{aiResult.summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-[#4a3b2c]">Key Findings</h4>
                  {aiResult.findings?.map((f: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-[#ece3d4] flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#fdfaf6] flex items-center justify-center mr-3 shrink-0 border border-[#ece3d4]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e87c48]"></span>
                      </div>
                      <div>
                        <h5 className="font-bold text-[#4a3b2c] text-sm mb-1">{f.finding_type}</h5>
                        <p className="text-sm text-[#8c7b6c]">{f.statement}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#4a3b2c]">Recommendations</h4>
                  {aiResult.recommendations?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-[#ece3d4] shadow-sm">
                      <ul className="space-y-3">
                        {aiResult.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <ChevronRight className="w-5 h-5 text-[#c89f70] mr-1 shrink-0" />
                            <span className="text-sm text-[#5c4d3c] leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </Layout>
  );
}

function ScoreBar({ label, score }: { label: string; score?: number }) {
  const s = score ?? 0;
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-bold text-[#8c7b6c]">{label}</span>
      <div className="flex items-center space-x-3">
        <div className={cn("flex-1 h-3 rounded-full", getScoreBarBg(s))}>
          <div className={cn("h-3 rounded-full transition-all duration-500", getScoreColor(s))} style={{ width: `${Math.min(s, 100)}%` }} />
        </div>
        <span className="text-lg font-bold text-[#4a3b2c] w-8 text-right">{Math.round(s)}</span>
      </div>
    </div>
  );
}

function calculatePercentageDifference(
  outletValue: number | null | undefined,
  averageValue: number | null | undefined
) {
  const outlet = Number(outletValue);
  const average = Number(averageValue);

  if (!Number.isFinite(outlet) || !Number.isFinite(average) || average === 0) {
    return null;
  }

  return ((outlet - average) / average) * 100;
}

function ComparisonRow({ label, val, avg }: { label: string; val: number; avg: number }) {
  const diff = calculatePercentageDifference(val, avg);
  if (diff === null) {
    return (
      <div className="flex justify-between items-center py-1 border-b border-[#ece3d4]/50 last:border-0">
        <span className="text-sm font-medium text-[#8c7b6c]">{label}</span>
        <span className="text-sm font-bold text-[#bbaaa0]">N/A</span>
      </div>
    );
  }
  const isPos = diff >= 0;
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#ece3d4]/50 last:border-0">
      <span className="text-sm font-medium text-[#8c7b6c]">{label}</span>
      <span className={cn("text-sm font-bold", isPos ? "text-green-600" : "text-red-600")}>
        {isPos ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
      </span>
    </div>
  );
}
