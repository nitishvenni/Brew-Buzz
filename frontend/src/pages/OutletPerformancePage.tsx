import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { fetchOutletScores, fetchSummary } from '../api/client';
import { Loader2 } from 'lucide-react';
import { 
  OutletKPIs, 
  RevenueByOutletChart, 
  OrdersByOutletChart, 
  HealthDistribution, 
  TopPerformingOutlets, 
  QuickInsights 
} from '../components/outlet-performance/OverviewComponents';
import { OutletPerformanceTable } from '../components/outlet-performance/OutletPerformanceTable';

const START_DATE = "2026-06-01T00:00:00Z";
const END_DATE = "2026-08-30T00:00:00Z";

export function OutletPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [scoresData, summaryData] = await Promise.all([
          fetchOutletScores(START_DATE, END_DATE),
          fetchSummary(START_DATE, END_DATE)
        ]);
        setScores(scoresData.outlet_scores || []);
        setAvgScore(scoresData.franchise_average_score || 0);
        setSummary(summaryData);
      } catch (err: any) {
        setError(err.message || "Failed to load outlet performance");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Layout title="Outlet Performance" subtitle="Compare outlet performance, track key metrics, and identify growth opportunities.">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin mb-4" />
          <p className="text-[#8c7b6c] font-medium text-lg animate-pulse">Loading outlet performance data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Outlet Performance" subtitle="Compare outlet performance, track key metrics, and identify growth opportunities.">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h3 className="text-xl font-bold mb-2">Failed to load</h3>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Outlet Performance" subtitle="Compare outlet performance, track key metrics, and identify growth opportunities.">
      {/* Top KPIs */}
      <OutletKPIs summary={summary} activeOutlets={scores.length} avgScore={avgScore} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="h-[300px]">
          <RevenueByOutletChart scores={scores} />
        </div>
        <div className="h-[300px]">
          <OrdersByOutletChart scores={scores} />
        </div>
        <div className="h-[300px]">
          <HealthDistribution scores={scores} />
        </div>
      </div>

      {/* Bottom Layout: Table + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <OutletPerformanceTable scores={scores} />
        </div>
        <div className="space-y-6">
          <TopPerformingOutlets scores={scores} />
          <QuickInsights scores={scores} />
        </div>
      </div>
    </Layout>
  );
}
