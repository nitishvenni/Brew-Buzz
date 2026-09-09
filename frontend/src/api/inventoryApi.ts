import { API_BASE } from './client';

export async function fetchInventorySummary() {
    const res = await fetch(`${API_BASE}/inventory/summary`);
    if (!res.ok) throw new Error("Failed to fetch inventory summary");
    const data = await res.json();
    return {
        ...data,
        low_stock_items: data.low_items || 0
    };
}

export async function fetchInventoryItems() {
    const res = await fetch(`${API_BASE}/inventory/items`);
    if (!res.ok) throw new Error("Failed to fetch inventory items");
    const data = await res.json();
    return data.map((item: any) => ({
        ...item,
        inventory_item_id: item.id
    }));
}

export async function fetchInventoryAlerts() {
    const res = await fetch(`${API_BASE}/inventory/alerts`);
    if (!res.ok) throw new Error("Failed to fetch inventory alerts");
    const data = await res.json();
    return data.map((alert: any) => {
        let alert_type = 'LOW_STOCK';
        if (alert.title.includes('Critical')) alert_type = 'CRITICAL_STOCK';
        if (alert.title.includes('Wastage')) alert_type = 'HIGH_WASTAGE';
        if (alert.title.includes('Abnormal')) alert_type = 'HIGH_VARIANCE';
        
        return {
            ...alert,
            alert_type
        };
    });
}

export async function fetchReorderRecommendations() {
    const res = await fetch(`${API_BASE}/inventory/recommendations`);
    if (!res.ok) throw new Error("Failed to fetch reorder recommendations");
    return res.json();
}

export async function fetchInventoryTrends() {
    const res = await fetch(`${API_BASE}/inventory/trends`);
    if (!res.ok) throw new Error("Failed to fetch inventory trends");
    return res.json();
}

export async function fetchInventoryItemDetail(id: string) {
    const res = await fetch(`${API_BASE}/inventory/items/${id}`);
    if (!res.ok) throw new Error("Failed to fetch inventory item details");
    return res.json();
}

export async function fetchInventoryHistory(inventoryItemId: string) {
  const response = await fetch(`${API_BASE}/inventory/items/${inventoryItemId}/history`);
  if (!response.ok) throw new Error('Failed to fetch inventory history');
  return response.json();
}

export async function investigateInventory(inventoryItemId: number | null, objective: string, userQuestion: string) {
  const response = await fetch(`${API_BASE}/agents/inventory/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inventory_item_id: inventoryItemId,
      objective,
      user_question: userQuestion,
    }),
  });
  if (!response.ok) throw new Error('Failed to run AI investigation');
  return response.json();
}
