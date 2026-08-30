export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchSummary(startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE}/analytics/summary?start_date=${startDate}&end_date=${endDate}`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    return res.json();
}

export async function fetchOutletScores(startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE}/analytics/outlet-scores?start_date=${startDate}&end_date=${endDate}`);
    if (!res.ok) throw new Error("Failed to fetch scores");
    return res.json();
}

export async function fetchTrends(startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE}/analytics/trends?start_date=${startDate}&end_date=${endDate}`);
    if (!res.ok) throw new Error("Failed to fetch trends");
    return res.json();
}

export async function fetchProducts(startDate: string, endDate: string, limit: number = 5) {
    const res = await fetch(`${API_BASE}/analytics/products?start_date=${startDate}&end_date=${endDate}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function fetchCategories(startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE}/analytics/categories?start_date=${startDate}&end_date=${endDate}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function investigateOutlet(outletId: number, startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE}/agents/outlet-performance/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            outlet_id: outletId,
            start_date: startDate,
            end_date: endDate,
            objective: "Analyze outlet performance",
            user_question: "Analyze the performance of this outlet and explain the main evidence-backed issues."
        })
    });
    if (!res.ok) throw new Error("Failed to fetch AI insights");
    return res.json();
}

export async function fetchOrders(limit: number = 5) {
    const res = await fetch(`${API_BASE}/analytics/orders?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}
