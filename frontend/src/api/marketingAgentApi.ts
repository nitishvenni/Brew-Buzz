import { API_BASE } from './client';

export interface MarketingAgentRequest {
  objective: string;
  user_question: string;
  outlet_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface MarketingAgentResponse {
  summary: string;
  key_findings: string[];
  risks: string[];
  recommendations: string[];
  confidence: "High" | "Medium" | "Low";
  data_sources_used: string[];
}

export async function investigateMarketing(request: MarketingAgentRequest): Promise<MarketingAgentResponse> {
  const response = await fetch(`${API_BASE}/agents/marketing/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to analyze marketing data');
  }

  return response.json();
}
