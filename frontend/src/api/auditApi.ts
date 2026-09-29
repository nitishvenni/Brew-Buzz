import { API_BASE } from './client';

export interface SnapshotOutletMetrics {
    revenue: number;
    orders: number;
    aov: number;
    growth_pct?: number | null;
}

export interface SnapshotInventoryMetrics {
    critical_items: number;
    low_stock_items: number;
    total_inventory_value?: number | null;
}

export interface SnapshotWorkforceMetrics {
    active_staff: number;
    attendance_rate: number;
    overtime_hours: number;
    orders_per_staff_hour: number;
}

export interface SnapshotMarketingMetrics {
    revenue_growth_pct?: number | null;
    order_growth_pct?: number | null;
    aov_growth_pct?: number | null;
    product_count: number;
}

export interface AuditFranchiseSnapshot {
    outlet_metrics: SnapshotOutletMetrics;
    inventory_metrics: SnapshotInventoryMetrics;
    workforce_metrics: SnapshotWorkforceMetrics;
    marketing_metrics: SnapshotMarketingMetrics;
}

const numericKeys = [
    'revenue', 'orders', 'aov', 'growth_pct',
    'critical_items', 'low_stock_items', 'total_inventory_value',
    'active_staff', 'attendance_rate', 'overtime_hours', 'orders_per_staff_hour',
    'revenue_growth_pct', 'order_growth_pct', 'aov_growth_pct', 'product_count',
    'metric_value', 'threshold'
];

function parseDecimals(text: string) {
    return JSON.parse(text, (key, value) => {
        if (numericKeys.includes(key) && typeof value === 'string') {
            return Number(value);
        }
        return value;
    });
}

export async function fetchAuditSnapshot(startDate: string, endDate: string, outletId?: number | null): Promise<AuditFranchiseSnapshot> {
    let url = `${API_BASE}/audit/snapshot?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    if (outletId) {
        url += `&outlet_id=${outletId}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch audit snapshot');
    }
    return parseDecimals(await res.text());
}
export interface AuditAlert {
    domain: string;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    outlet_id: number | null;
    metric_value: number | null;
    threshold: number | null;
}

export interface EvidenceMetric {
    label: string;
    value: number | string;
    unit?: string | null;
    direction?: string | null;
    comparison?: string | null;
    status?: string | null;
}

export interface StructuredEvidence {
    domain: string;
    title: string;
    metrics: EvidenceMetric[];
}

export interface AuditCrossDomainSignal {
    signal_type: string;
    severity: string;
    domain_a: string;
    domain_b: string;
    outlet_id: number | null;
    title: string;
    description: string;
    evidence: string[];
    structured_evidence?: StructuredEvidence[] | null;
}

export async function fetchAuditAlerts(startDate: string, endDate: string, outletId?: number | null): Promise<AuditAlert[]> {
    let url = `${API_BASE}/audit/alerts?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    if (outletId != null) {
        url += `&outlet_id=${outletId}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch audit alerts');
    }
    return parseDecimals(await res.text());
}

export async function fetchAuditSignals(startDate: string, endDate: string, outletId?: number | null): Promise<AuditCrossDomainSignal[]> {
    let url = `${API_BASE}/audit/signals?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    if (outletId != null) {
        url += `&outlet_id=${outletId}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch audit signals');
    }
    return parseDecimals(await res.text());
}
