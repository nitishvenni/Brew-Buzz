import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { KPICards } from '../components/dashboard/KPICards';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { OverviewAiInsights } from '../components/dashboard/OverviewAiInsights';
import { TopProducts, CategoryPerformance, PromoCard } from '../components/dashboard/ProductsCategories';
import { RecentOrders, QuickActions } from '../components/dashboard/MiscPanels';
import { OutletHealthSnapshot } from '../components/dashboard/OutletHealthSnapshot';
import { fetchSummary, fetchOutletScores, fetchTrends, fetchProducts, fetchCategories, fetchOrders } from '../api/client';
import { Loader2 } from 'lucide-react';

const START_DATE = "2026-06-01T00:00:00Z";
const END_DATE = "2026-08-30T00:00:00Z";

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<any>({
    summary: null,
    scores: null,
    avgScore: 0,
    trends: [],
    products: [],
    categories: [],
    orders: []
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summary, scores, trends, products, categories, orders] = await Promise.all([
          fetchSummary(START_DATE, END_DATE),
          fetchOutletScores(START_DATE, END_DATE),
          fetchTrends(START_DATE, END_DATE),
          fetchProducts(START_DATE, END_DATE, 5),
          fetchCategories(START_DATE, END_DATE),
          fetchOrders(5)
        ]);

        setData({
          summary,
          scores: scores.outlet_scores,
          avgScore: scores.franchise_average_score,
          trends,
          products,
          categories,
          orders
        });
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin mb-4" />
          <p className="text-[#8c7b6c] font-medium text-lg animate-pulse">Loading Brew Buzz Intelligence...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h3 className="text-xl font-bold mb-2">Failed to load dashboard</h3>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <KPICards
        summary={data.summary}
        activeOutlets={data.scores?.length || 0}
        avgScore={data.avgScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px]">
          <TrendsChart data={data.trends} />
        </div>
        <div className="h-[450px]">
          <OverviewAiInsights 
            scores={data.scores} 
            products={data.products} 
            categories={data.categories} 
          />
        </div>
      </div>

      <OutletHealthSnapshot
        scores={data.scores || []}
        avgScore={data.avgScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[380px]">
          <TopProducts products={data.products} />
        </div>
        <div className="h-[380px]">
          <CategoryPerformance
            categories={data.categories}
            totalRevenue={data.summary?.revenue || 0}
          />
        </div>
        <div className="h-[380px]">
          <PromoCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-[340px]">
          <RecentOrders orders={data.orders} />
        </div>
        <div className="h-[340px]">
          <QuickActions />
        </div>
      </div>
    </Layout>
  );
}
