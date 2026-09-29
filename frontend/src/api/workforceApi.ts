import { API_BASE } from './client';

export interface WorkforceSummary {
    total_staff: number;
    active_staff: number;
    inactive_staff: number;
    scheduled_shifts: number;
    completed_shifts: number;
    absent_shifts: number;
    late_shifts: number;
    scheduled_hours: number;
    actual_hours: number;
    overtime_hours: number;
    attendance_rate: number;
    absence_rate: number;
    late_rate: number;
    total_orders: number;
    orders_per_staff_hour: number;
    status: string;
    reasons: string[];
}

export interface EmployeeWorkforceMetrics {
    employee_id: number;
    employee_code: string;
    name: string;
    role: string;
    outlet: string;
    scheduled_shifts: number;
    completed_shifts: number;
    absent_shifts: number;
    late_shifts: number;
    scheduled_hours: number;
    actual_hours: number;
    overtime_hours: number;
    attendance_rate: number;
    late_rate: number;
    average_hours_per_shift: number;
}

export interface OutletWorkforceMetrics {
    outlet_id: number;
    outlet_name: string;
    active_staff: number;
    scheduled_shifts: number;
    completed_shifts: number;
    absent_shifts: number;
    late_shifts: number;
    scheduled_hours: number;
    actual_hours: number;
    overtime_hours: number;
    attendance_rate: number;
    absence_rate: number;
    late_rate: number;
    order_count: number;
    orders_per_staff_hour: number;
    status: string;
    reasons: string[];
}

export interface WorkforceTrend {
    date: string;
    attendance_rate: number;
    scheduled_shifts: number;
    completed_shifts: number;
    absent_shifts: number;
    orders: number;
    actual_staff_hours: number;
    orders_per_staff_hour: number;
    overtime_hours: number;
}

export interface WorkforceAlert {
    type: string;
    severity: string;
    outlet_id: number | null;
    outlet_name: string | null;
    metric: string;
    value: number;
    threshold: number;
    message: string;
}

function buildQuery(params: Record<string, string | number | undefined>) {
    const query = new URLSearchParams();
    if (params.start_date) query.append('start_date', String(params.start_date));
    if (params.end_date) query.append('end_date', String(params.end_date));
    if (params.outlet_id) query.append('outlet_id', params.outlet_id.toString());
    if (params.role_id) query.append('role_id', params.role_id.toString());
    if (params.employment_status) query.append('employment_status', String(params.employment_status));
    return query.toString();
}

export async function getWorkforceSummary(params: { start_date?: string, end_date?: string, outlet_id?: number } = {}): Promise<WorkforceSummary> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/summary?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce summary");
    return res.json();
}

export async function getWorkforceOutlets(params: { start_date?: string, end_date?: string } = {}): Promise<OutletWorkforceMetrics[]> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/outlets?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce outlets");
    return res.json();
}

export async function getWorkforceEmployees(params: { start_date?: string, end_date?: string, outlet_id?: number, role_id?: number, employment_status?: string } = {}): Promise<EmployeeWorkforceMetrics[]> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/employees?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce employees");
    return res.json();
}

export async function getWorkforceEmployee(employeeId: number, params: { start_date?: string, end_date?: string } = {}): Promise<EmployeeWorkforceMetrics> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/employees/${employeeId}?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce employee");
    return res.json();
}

export async function getWorkforceTrends(params: { start_date?: string, end_date?: string } = {}): Promise<WorkforceTrend[]> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/trends?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce trends");
    return res.json();
}

export async function getWorkforceAlerts(params: { start_date?: string, end_date?: string } = {}): Promise<WorkforceAlert[]> {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE}/analytics/workforce/alerts?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch workforce alerts");
    return res.json();
}
