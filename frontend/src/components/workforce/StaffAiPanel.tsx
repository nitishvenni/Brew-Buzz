import { useState } from 'react';
import { 
  X, 
  Loader2, 
  MessageSquare, 
  AlertTriangle, 
  ListTodo, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  CheckCircle2,
  Users
} from 'lucide-react';
import { investigateStaff } from '../../api/staffAgentApi';
import type { StaffAgentResponse } from '../../api/staffAgentApi';

export interface StaffAiPanelProps {
  context: 'franchise' | 'outlet' | 'employee';
  outletId?: number;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  onClose?: () => void;
}

const loadingSteps = [
  "Connecting to deterministic workforce tools...",
  "Retrieving attendance and shift metrics...",
  "Evaluating operational patterns...",
  "Structuring findings..."
];

export function StaffAiPanel({ context, outletId, employeeId, startDate, endDate, title, onClose }: StaffAiPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StaffAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const getQuickPrompts = () => {
    if (context === 'employee') {
      return [
        "Summarize this employee's recorded workforce metrics.",
        "How do this employee's attendance metrics compare with the available data?",
        "Are there notable overtime or lateness patterns?"
      ];
    }
    if (context === 'outlet') {
      return [
        "Explain the workforce situation for this outlet.",
        "Are there significant attendance issues here?",
        "Is overtime elevated at this outlet?",
        "Does this outlet have high workload density?"
      ];
    }
    return [
      "Give me a workforce performance summary.",
      "Which outlets need staffing attention?",
      "Are there significant attendance issues?",
      "Where is overtime elevated?",
      "Which outlets have high workload density?"
    ];
  };

  const quickPrompts = getQuickPrompts();

  const handleAnalyze = async (query: string) => {
    if (!query.trim() || loading) return;
    
    setQuestion(query);
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await investigateStaff({
        objective: `Analyze workforce conditions for ${context}`,
        user_question: query,
        outlet_id: outletId,
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected operational error occurred while retrieving AI intelligence.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(4);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#ece3d4] flex flex-col h-[700px] max-h-[85vh] overflow-hidden sticky top-6">
      <div className="bg-gradient-to-r from-[#4a3b2c] to-[#604e3c] p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center">
              Staff Intelligence AI
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded border border-white/20 text-white/90 uppercase tracking-widest font-extrabold bg-white/10">
                Agent
              </span>
            </h3>
            <p className="text-white/70 text-xs mt-0.5">
              {title || "Operational Workforce Analysis"}
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        {!result && !loading && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <p className="text-sm text-[#8c7b6c] mb-6 leading-relaxed">
              Investigate workforce performance using operational workforce data. Select a prompt or ask a custom question below.
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Quick Investigations</p>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(prompt)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#ece3d4] rounded-xl text-sm font-medium text-[#4a3b2c] hover:border-[#c89f70] hover:bg-[#fdfaf6] hover:text-[#c89f70] transition-colors group shadow-sm hover:shadow text-left"
                >
                  <span className="pr-4">{prompt}</span>
                  <ArrowRight className="w-4 h-4 text-[#ece3d4] group-hover:text-[#c89f70] transition-colors shrink-0" />
                </button>
              ))}
            </div>
            
            <div className="mt-auto pt-4 border-t border-[#f5efe6]">
              <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3">Custom Question</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyze(question);
                }} 
                className="flex flex-col space-y-3"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Why does this outlet have a high workload?"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#fdfaf6] border border-[#ece3d4] shadow-inner rounded-xl text-sm focus:outline-none focus:border-[#c89f70] focus:ring-1 focus:ring-[#c89f70] disabled:opacity-50 transition-all text-[#4a3b2c]"
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#4a3b2c] text-white text-sm font-bold rounded-xl hover:bg-[#3d3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Investigate <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mb-6 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#c89f70] animate-spin" />
            </div>
            <p className="text-[#4a3b2c] font-bold mb-8 text-center">AI Staff Agent is investigating...</p>
            
            <div className="w-full max-w-sm space-y-4">
              {loadingSteps.map((step, idx) => (
                <div key={idx} className={`flex items-center text-sm ${idx < loadingStep ? 'text-green-600 font-medium' : idx === loadingStep ? 'text-[#4a3b2c] font-bold animate-pulse' : 'text-[#bbaaa0]'}`}>
                  {idx < loadingStep ? (
                    <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                  ) : idx === loadingStep ? (
                    <Activity className="w-5 h-5 mr-3 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 mr-3 rounded-full border-2 border-[#ece3d4] shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col h-full justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-[#4a3b2c] font-bold mb-2">Investigation Failed</p>
            <p className="text-sm text-red-600 px-4">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-6 px-6 py-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-lg text-sm font-medium text-[#4a3b2c] hover:bg-[#f3ede4]"
            >
              Try Again
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col h-full">
            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1 pb-4">
              <div className="bg-white border-l-2 border-[#c89f70] pl-4 py-1 mb-2">
                <p className="text-[10px] text-[#8c7b6c] uppercase tracking-wider font-bold mb-1">Investigation Request</p>
                <p className="font-bold text-[#4a3b2c] italic text-sm">"{question}"</p>
              </div>

              <div className="bg-[#fdfaf6] p-5 rounded-xl border border-[#ece3d4]">
                <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-2 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1.5" /> Summary
                </h4>
                <p className="text-sm text-[#4a3b2c] leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-3 border-b border-[#ece3d4] pb-2">Key Findings</h4>
                {result.key_findings && result.key_findings.length > 0 ? (
                  <ul className="space-y-3 mt-3">
                    {result.key_findings.map((finding: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm text-[#4a3b2c]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c89f70] mr-3 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#8c7b6c] italic mt-2">No specific findings extracted.</p>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-extrabold text-red-800 uppercase tracking-widest mb-3 border-b border-red-100 pb-2 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> Identified Risks
                </h4>
                {result.risks && result.risks.length > 0 ? (
                  <ul className="space-y-2 mt-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                    {result.risks.map((risk: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm text-red-900 font-medium">
                        <span className="mr-2">dY"'</span>
                        <span className="leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#8c7b6c] italic mt-2">No specific risks identified from the available data.</p>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-3 border-b border-[#ece3d4] pb-2 flex items-center">
                  <ListTodo className="w-3 h-3 mr-1.5" /> Recommended Actions
                </h4>
                {result.recommendations && result.recommendations.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start bg-white border border-[#ece3d4] p-3.5 rounded-xl shadow-sm">
                        <span className="text-[#c89f70] font-bold mr-3">{idx + 1}.</span>
                        <span className="text-sm font-bold text-[#4a3b2c] leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8c7b6c] italic mt-2">No recommendations available because AI reasoning is unavailable.</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-[#ece3d4] flex items-center justify-between mt-auto shrink-0 bg-white">
              <span className="text-[10px] text-[#8c7b6c] flex items-center font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                Verified Data
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setResult(null);
                    setQuestion("");
                  }}
                  className="text-[10px] font-extrabold uppercase tracking-wider text-[#8c7b6c] bg-[#fdfaf6] px-2.5 py-1.5 rounded-md border border-[#ece3d4] hover:bg-[#f3ede4] transition-colors"
                >
                  New Investigation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
