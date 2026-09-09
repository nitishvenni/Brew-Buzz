import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { fetchInventoryItemDetail, fetchInventoryHistory } from '../api/inventoryApi';
import { ArrowLeft } from 'lucide-react';
import { IngredientHealthCard } from '../components/inventory/IngredientHealthCard';
import { ReorderIntelligence } from '../components/inventory/ReorderIntelligence';
import { InventoryHistory } from '../components/inventory/InventoryHistory';
import { ConsumptionAnalysis } from '../components/inventory/ConsumptionAnalysis';
import { InventoryAiPanel } from '../components/inventory/InventoryAiPanel';

export function InventoryDetailPage() {
  const { inventoryItemId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!inventoryItemId) return;
      try {
        const [detailRes, histRes] = await Promise.all([
          fetchInventoryItemDetail(inventoryItemId),
          fetchInventoryHistory(inventoryItemId)
        ]);
        setDetail(detailRes);
        setHistory(histRes);
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory item details. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [inventoryItemId]);

  return (
    <Layout 
      title={detail ? detail.ingredient_name : error ? 'Item Not Found' : 'Loading...'}
      subtitle="Inventory Analysis - Current stock health, consumption patterns, and reorder intelligence."
    >
      <div className="flex flex-col space-y-6">
        {/* Detail Header overrides layout title area slightly by adding back button and tags */}
        <div className="flex flex-col space-y-4">
            <button 
                onClick={() => navigate('/inventory')}
                className="flex items-center text-sm font-medium text-[#c89f70] hover:text-[#b08558] w-fit transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Inventory
            </button>
            {detail && (
                <div className="flex items-center space-x-3 text-sm font-medium">
                    <span className="bg-white border border-[#ece3d4] text-[#8c7b6c] px-3 py-1 rounded-full shadow-sm">
                        Outlet: {detail.outlet_name}
                    </span>
                    <span className="bg-white border border-[#ece3d4] text-[#8c7b6c] px-3 py-1 rounded-full shadow-sm">
                        Stock: {detail.current_quantity} {detail.unit}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-white shadow-sm ${
                        detail.status === 'CRITICAL' ? 'bg-red-500' :
                        detail.status === 'LOW' ? 'bg-orange-500' :
                        detail.status === 'WATCH' ? 'bg-amber-500' :
                        detail.status === 'HEALTHY' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                        Status: {detail.status}
                    </span>
                </div>
            )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">Loading analysis...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-200">
            {error}
          </div>
        ) : detail && (
          <>
            {/* Summary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#ece3d4] shadow-sm">
                    <p className="text-xs text-[#8c7b6c] font-bold uppercase tracking-wider">Current Stock</p>
                    <p className="text-2xl font-extrabold mt-1 text-[#4a3b2c]">{detail.current_quantity} {detail.unit}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ece3d4] shadow-sm">
                    <p className="text-xs text-[#8c7b6c] font-bold uppercase tracking-wider">Daily Usage</p>
                    <p className="text-2xl font-extrabold mt-1 text-[#4a3b2c]">{detail.average_daily_consumption} {detail.unit}/day</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ece3d4] shadow-sm">
                    <p className="text-xs text-[#8c7b6c] font-bold uppercase tracking-wider">Days Remaining</p>
                    <p className="text-2xl font-extrabold mt-1 text-[#4a3b2c]">{detail.days_remaining !== null ? `${detail.days_remaining} days` : 'Infinite'}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#ece3d4] shadow-sm">
                    <p className="text-xs text-[#8c7b6c] font-bold uppercase tracking-wider">Supplier Lead Time</p>
                    <p className="text-2xl font-extrabold mt-1 text-[#4a3b2c]">{detail.supplier_lead_time_days} days</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                  <IngredientHealthCard detail={detail} />
                  <ConsumptionAnalysis detail={detail} history={history} />
                  <InventoryHistory history={history} unit={detail.unit} />
              </div>
              <div className="space-y-6">
                  <ReorderIntelligence detail={detail} />
                  <InventoryAiPanel detail={detail} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

