import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { MarketingDateFilter } from '../components/marketing/MarketingDateFilter';
import type { DatePreset } from '../components/marketing/MarketingDateFilter';
import { MarketingKPICards } from '../components/marketing/MarketingKPICards';
import { MarketingTrendsChart } from '../components/marketing/MarketingTrendsChart';
import { MarketingAlerts } from '../components/marketing/MarketingAlerts';
import { ProductMarketingTable } from '../components/marketing/ProductMarketingTable';
import { CategoryMarketing } from '../components/marketing/CategoryMarketing';
import { OutletMarketingTable } from '../components/marketing/OutletMarketingTable';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { startOfDay, subDays } from 'date-fns';
import { MarketingAiPanel } from '../components/marketing/MarketingAiPanel';
import { Sparkles } from 'lucide-react';


import {
  getMarketingSummary,
  getMarketingProducts,
  getMarketingCategories,
  getMarketingOutlets,
  getMarketingTrends,
  getMarketingAlerts,
} from '../api/marketingApi';
import type { MarketingSummary, ProductMarketingMetrics, CategoryMarketingMetrics, OutletMarketingMetrics, MarketingTrend, MarketingAlert } from '../api/marketingApi';

// Need to fetch outlets for the dropdown
import { API_BASE } from '../api/client';

export function MarketingPage() {
  // Global filters
  const [preset, setPreset] = useState<DatePreset>('30days');
  const [startDate, setStartDate] = useState(() => startOfDay(subDays(new Date(), 29)).toISOString());
  const [endDate, setEndDate] = useState(() => new Date().toISOString());
  const [outletId, setOutletId] = useState<number | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Reference lists
  const [outletsList, setOutletsList] = useState<{id: number, name: string}[]>([]);

  // Page data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<MarketingSummary | null>(null);
  const [products, setProducts] = useState<ProductMarketingMetrics[]>([]);
  const [categories, setCategories] = useState<CategoryMarketingMetrics[]>([]);
  const [outletsData, setOutletsData] = useState<OutletMarketingMetrics[]>([]);
  const [trends, setTrends] = useState<MarketingTrend[]>([]);
  const [alerts, setAlerts] = useState<MarketingAlert[]>([]);

  // Fetch outlet list once on mount
  useEffect(() => {
    async function fetchOutlets() {
      try {
        const res = await fetch(`${API_BASE}/analytics/outlets?start_date=${startDate}&end_date=${endDate}`);
        if (res.ok) {
          const data = await res.json();
          setOutletsList(data.map((o: any) => ({ id: o.outlet_id, name: o.outlet_name })));
        }
      } catch (err) {
        console.error("Failed to load outlets for filter", err);
      }
    }
    fetchOutlets();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        summaryRes,
        productsRes,
        categoriesRes,
        trendsRes,
        alertsRes
      ] = await Promise.all([
        getMarketingSummary(startDate, endDate, outletId),
        getMarketingProducts(startDate, endDate, outletId),
        getMarketingCategories(startDate, endDate, outletId),
        getMarketingTrends(startDate, endDate, outletId),
        getMarketingAlerts(startDate, endDate, outletId)
      ]);

      setSummary(summaryRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setTrends(trendsRes);
      setAlerts(alertsRes);

      // Outlet performance table is only useful at the franchise level (no outlet filter)
      if (!outletId) {
        const outletsPerfRes = await getMarketingOutlets(startDate, endDate);
        setOutletsData(outletsPerfRes);
      } else {
        setOutletsData([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load marketing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, outletId]);

  return (
    <Layout 
      title="Marketing Intelligence" 
      subtitle="Demand, product, category and outlet performance"
    >
      {/* AI Panel */}
      {showAiPanel && (
        <>
          <div 
            className="fixed inset-0 bg-[#4a3b2c]/20 backdrop-blur-sm z-40"
            onClick={() => setShowAiPanel(false)}
          ></div>
          <MarketingAiPanel 
            outletId={outletId || undefined} 
            startDate={startDate} 
            endDate={endDate} 
            onClose={() => setShowAiPanel(false)} 
          />
        </>
      )}

      {/* Global Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 bg-white p-4 rounded-2xl border border-[#ece3d4] shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-[#c89f70]" />
          <select 
            value={outletId || ''} 
            onChange={(e) => setOutletId(e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent text-sm font-bold text-[#4a3b2c] outline-none cursor-pointer"
          >
            <option value="">All Outlets (Franchise)</option>
            {outletsList.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <MarketingDateFilter 
            preset={preset}
            startDate={startDate}
            endDate={endDate}
            onChange={(p, start, end) => {
              setPreset(p);
              setStartDate(start);
              setEndDate(end);
            }}
          />
          <button 
            onClick={() => setShowAiPanel(true)}
            className="flex items-center px-4 py-2 bg-[#fdfaf6] border border-[#c89f70] text-[#c89f70] font-bold rounded-lg hover:bg-[#c89f70] hover:text-white transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            AI Investigation
          </button>
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-lg hover:border-[#c89f70] text-[#8c7b6c] transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col items-center justify-center h-[300px]">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-bold text-rose-800 mb-2">{error}</h3>
          <button 
            onClick={() => setShowAiPanel(true)}
            className="flex items-center px-4 py-2 bg-[#fdfaf6] border border-[#c89f70] text-[#c89f70] font-bold rounded-lg hover:bg-[#c89f70] hover:text-white transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            AI Investigation
          </button>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <MarketingKPICards summary={summary as MarketingSummary} loading={loading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MarketingTrendsChart trends={trends} loading={loading} />
            </div>
            <div>
              <MarketingAlerts alerts={alerts} loading={loading} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductMarketingTable products={products} loading={loading} />
            <CategoryMarketing categories={categories} loading={loading} />
          </div>

          {!outletId && (
            <OutletMarketingTable outlets={outletsData} loading={loading} />
          )}
        </div>
      )}
    </Layout>
  );
}
