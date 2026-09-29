import { API_BASE } from './client';
import type { StructuredEvidence } from './auditApi';

export interface InvestigationOutletContext {
  revenue?: number;
  orders?: number;
  active_staff?: number;
  attendance_rate?: number;
  critical_inventory_count?: number;
  revenue_growth_pct?: number | null;
}

export interface AuditAgentRequest {
    outlet_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    objective: string;
    user_question: string;
    structured_evidence?: StructuredEvidence[] | null;
    outlet_context?: InvestigationOutletContext | null;
}

export interface ManagementAction {
    action: string;
    rationale: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    supporting_evidence: string[];
    expected_operational_effect: string;
    monitor: string;
}

export interface AuditAgentResponse {
    summary: string;
    cross_domain_signals: string[];
    attention_areas: string[];
    recommendations: ManagementAction[];
    confidence: 'High' | 'Medium' | 'Low' | null;
    data_sources_used: string[];
}

export async function investigateAudit(request: AuditAgentRequest): Promise<AuditAgentResponse> {
    const res = await fetch(`${API_BASE}/agents/audit/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
    });
    
    if (!res.ok) {
        throw new Error('Failed to run Audit AI investigation');
    }
    
    return await res.json();
}
