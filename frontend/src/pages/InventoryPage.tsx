import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  fetchInventorySummary,
  fetchInventoryItems,
  fetchInventoryAlerts,
  fetchReorderRecommendations
} from '../api/inventoryApi';
import { InventoryKPICards } from '../components/inventory/InventoryKPICards';
import { InventoryHealthOverview } from '../components/inventory/InventoryHealthOverview';
import { InventoryAlerts } from '../components/inventory/InventoryAlerts';
import { ReorderRecommendations } from '../components/inventory/ReorderRecommendations';
import { InventoryItemsTable } from '../components/inventory/InventoryItemsTable';

export function InventoryPage() {
  const [summary, setSummary] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, itemsRes, alertsRes, recsRes] = await Promise.all([
          fetchInventorySummary(),
          fetchInventoryItems(),
          fetchInventoryAlerts(),
          fetchReorderRecommendations()
        ]);
        setSummary(sumRes);
        setItems(itemsRes);
        setAlerts(alertsRes);
        setRecommendations(recsRes);
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <Layout 
        title="Inventory Intelligence" 
        subtitle="Monitor stock health, predict shortages, and optimize inventory across your franchise."
    >
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">Loading Inventory...</div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-200">
          {error}
        </div>
      ) : !summary ? (
        <div className="flex items-center justify-center py-20 text-gray-500">No inventory data available.</div>
      ) : (
        <>
          <InventoryKPICards summary={summary} />
          
          <div className="mb-6">
            <InventoryHealthOverview summary={summary} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">
            <InventoryAlerts alerts={alerts} />
            <ReorderRecommendations recommendations={recommendations} />
          </div>

          <InventoryItemsTable items={items} />
        </>
      )}
    </Layout>
  );
}

