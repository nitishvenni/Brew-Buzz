import { API_BASE } from './client';

export interface StaffAgentRequest {
  objective: string;
  user_question: string;
  employee_id?: number | null;
  outlet_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface StaffAgentResponse {
  summary: string;
  key_findings: string[];
  risks: string[];
  recommendations: string[];
  confidence?: string;
  data_sources_used: string[];
}

export async function investigateStaff(request: StaffAgentRequest): Promise<StaffAgentResponse> {
  const response = await fetch(`${API_BASE}/agents/staff/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      objective: request.objective,
      user_question: request.user_question,
      employee_id: request.employee_id || null,
      outlet_id: request.outlet_id || null,
      start_date: request.start_date || null,
      end_date: request.end_date || null,
    }),
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error('Validation error: Please provide a valid question and objective.');
    }
    throw new Error('Failed to run Staff Intelligence AI investigation.');
  }

  return response.json();
}
