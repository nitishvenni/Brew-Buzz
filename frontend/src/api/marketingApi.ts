export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface MarketingSummary {
  revenue: number;
  orders: number;
  aov: number;
  revenue_growth_pct: number | null;
  order_growth_pct: number | null;
  aov_growth_pct: number | null;
  peak_hour: number | null;
  peak_day: string | null;
  product_count: number;
  category_count: number;
  outlet_count: number;
}

export type MarketingSignal = "SURGING" | "GROWING" | "STABLE" | "DECLINING" | "NO_BASELINE";

export interface ProductMarketingMetrics {
  product_id: number;
  product_name: string;
  category_name: string | null;
  revenue: number;
  quantity_sold: number;
  order_count: number;
  revenue_contribution_pct: number;
  growth_pct: number | null;
  signal: MarketingSignal;
}

export interface CategoryMarketingMetrics {
  category_id: number;
  category_name: string;
  revenue: number;
  quantity_sold: number;
  revenue_contribution_pct: number;
  growth_pct: number | null;
  signal: MarketingSignal;
}

export interface OutletMarketingMetrics {
  outlet_id: number;
  outlet_name: string;
  revenue: number;
  orders: number;
  aov: number;
  revenue_growth_pct: number | null;
  order_growth_pct: number | null;
  signal: MarketingSignal;
}

export interface MarketingTrend {
  date: string;
  revenue: number;
  order_count: number;
  aov: number;
}

export interface MarketingAlert {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  entity_id: number | null;
  entity_name: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

const numericKeys = [
  'revenue', 'orders', 'aov', 'revenue_growth_pct', 'order_growth_pct', 'aov_growth_pct',
  'quantity_sold', 'order_count', 'revenue_contribution_pct', 'growth_pct'
];

function parseDecimals(text: string) {
  return JSON.parse(text, (key, value) => {
    if (numericKeys.includes(key) && typeof value === 'string') {
      return Number(value);
    }
    return value;
  });
}

function buildParams(startDate: string, endDate: string, outletId?: number | null) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  if (outletId) {
    params.append('outlet_id', outletId.toString());
  }
  return params.toString();
}

export async function getMarketingSummary(startDate: string, endDate: string, outletId?: number | null): Promise<MarketingSummary> {
  const res = await fetch(`${API_BASE}/marketing/summary?${buildParams(startDate, endDate, outletId)}`);
  if (!res.ok) throw new Error("Failed to fetch marketing summary");
  return parseDecimals(await res.text());
}

export async function getMarketingProducts(startDate: string, endDate: string, outletId?: number | null): Promise<ProductMarketingMetrics[]> {
  const res = await fetch(`${API_BASE}/marketing/products?${buildParams(startDate, endDate, outletId)}`);
  if (!res.ok) throw new Error("Failed to fetch product marketing metrics");
  return parseDecimals(await res.text());
}

export async function getMarketingCategories(startDate: string, endDate: string, outletId?: number | null): Promise<CategoryMarketingMetrics[]> {
  const res = await fetch(`${API_BASE}/marketing/categories?${buildParams(startDate, endDate, outletId)}`);
  if (!res.ok) throw new Error("Failed to fetch category marketing metrics");
  return parseDecimals(await res.text());
}

export async function getMarketingOutlets(startDate: string, endDate: string): Promise<OutletMarketingMetrics[]> {
  const res = await fetch(`${API_BASE}/marketing/outlets?${buildParams(startDate, endDate)}`);
  if (!res.ok) throw new Error("Failed to fetch outlet marketing metrics");
  return parseDecimals(await res.text());
}

export async function getMarketingTrends(startDate: string, endDate: string, outletId?: number | null): Promise<MarketingTrend[]> {
  const res = await fetch(`${API_BASE}/marketing/trends?${buildParams(startDate, endDate, outletId)}`);
  if (!res.ok) throw new Error("Failed to fetch marketing trends");
  return parseDecimals(await res.text());
}

export async function getMarketingAlerts(startDate: string, endDate: string, outletId?: number | null): Promise<MarketingAlert[]> {
  const res = await fetch(`${API_BASE}/marketing/alerts?${buildParams(startDate, endDate, outletId)}`);
  if (!res.ok) throw new Error("Failed to fetch marketing alerts");
  return parseDecimals(await res.text());
}
