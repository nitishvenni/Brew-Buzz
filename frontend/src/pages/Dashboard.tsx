import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { KPICards } from '../components/dashboard/KPICards';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { OutletPerformanceList } from '../components/dashboard/OutletPerformanceList';
import { AiInsights } from '../components/dashboard/AiInsights';
import { TopProducts, CategoryPerformance, PromoCard } from '../components/dashboard/ProductsCategories';
import { RecentOrders, QuickActions } from '../components/dashboard/MiscPanels';
import { fetchSummary, fetchOutletScores, fetchTrends, fetchProducts, fetchCategories, fetchOrders } from '../api/client';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<any>({
    summary: null,
    scores: null,
    trends: [],
    products: [],
    categories: [],
    orders: []
  });

  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const start = "2026-06-01T00:00:00Z";
        const end = "2026-08-30T00:00:00Z";
        
        const [summary, scores, trends, products, categories, orders] = await Promise.all([
          fetchSummary(start, end),
          fetchOutletScores(start, end),
          fetchTrends(start, end),
          fetchProducts(start, end, 5),
          fetchCategories(start, end),
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
        <div className="lg:col-span-2 h-96">
          <TrendsChart data={data.trends} />
        </div>
        <div className="h-96">
          <AiInsights 
            selectedOutlet={selectedOutlet} 
            scores={data.scores}
            startDate="2026-06-01T00:00:00Z"
            endDate="2026-08-30T00:00:00Z"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 h-96">
          <OutletPerformanceList 
            scores={data.scores} 
            onSelect={setSelectedOutlet} 
          />
        </div>
        <div className="h-96">
          <TopProducts products={data.products} />
        </div>
        <div className="h-96">
          <CategoryPerformance 
            categories={data.categories} 
            totalRevenue={data.summary?.revenue || 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="h-64">
          <PromoCard />
        </div>
        <div className="lg:col-span-2 h-64">
          <RecentOrders orders={data.orders} />
        </div>
        <div className="h-64">
          <QuickActions />
        </div>
      </div>
    </Layout>
  );
}
