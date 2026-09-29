import { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  AlertTriangle, 
  ListTodo, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { investigateMarketing } from '../../api/marketingAgentApi';
import type { MarketingAgentResponse } from '../../api/marketingAgentApi';

export interface MarketingAiPanelProps {
  outletId?: number;
  startDate?: string;
  endDate?: string;
  onClose?: () => void;
}

const loadingSteps = [
  "Connecting to deterministic marketing tools...",
  "Retrieving revenue and demand metrics...",
  "Evaluating operational patterns...",
  "Structuring findings..."
];

export function MarketingAiPanel({ outletId, startDate, endDate, onClose }: MarketingAiPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketingAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const quickPrompts = [
    "Which products are driving recent demand?",
    "Which products need attention?",
    "What are the current marketing alerts?",
    "Compare outlet performance.",
    "How has revenue changed recently?"
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await investigateMarketing({
        objective: "Investigate marketing performance",
        user_question: q,
        start_date: startDate,
        end_date: endDate,
        outlet_id: outletId
      });
      setResult(response);
    } catch (err) {
      setError("Marketing AI is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#fffcf8] shadow-2xl border-l border-[#f5efe6] z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex-none p-6 border-b border-[#f5efe6] bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d4af37] to-[#8c7b6c]"></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center text-[#c89f70]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-lg font-black text-[#4a3b2c] tracking-tight">Marketing Intelligence</h2>
            </div>
            <p className="text-sm font-medium text-[#c89f70]">Investigate demand, products, categories, and outlet performance.</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#8c7b6c] hover:text-[#4a3b2c] hover:bg-[#f5efe6] p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Context Badges */}
        <div className="flex flex-wrap gap-2 mt-4 relative z-10">
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-[#fdfaf6] border border-[#ece3d4] text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c89f70] mr-2"></span>
            Investigating: {outletId ? `Outlet ${outletId}` : 'All Outlets'}
          </div>
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-[#fdfaf6] border border-[#ece3d4] text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">
            {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} 
            {startDate && endDate ? ' - ' : ''} 
            {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Default Range'}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        {!loading && !result && !error && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <p className="text-sm text-[#8c7b6c] mb-6 leading-relaxed">
              Investigate your marketing data. Ask about demand, products, categories, alerts, or outlet performance.
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
                  placeholder="e.g. Which products are driving recent demand changes?"
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
            <div className="w-16 h-16 relative mb-6">
              <div className="absolute inset-0 border-4 border-[#f5efe6] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#c89f70] rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#c89f70] animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-black text-[#4a3b2c] mb-2">Analyzing marketing data...</h3>
            <p className="text-sm font-medium text-[#c89f70] text-center max-w-[250px] animate-pulse">
              {loadingSteps[loadingStep]}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setQuestion("");
              }}
              className="px-6 py-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-lg text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] hover:bg-white transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <div className="bg-[#fdfaf6] p-4 rounded-xl border border-[#ece3d4] mb-6">
              <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Question</p>
              <p className="text-sm font-medium text-[#4a3b2c]">{question}</p>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#c89f70]" />
                  <h3 className="text-xs font-bold text-[#4a3b2c] uppercase tracking-wider">Summary</h3>
                </div>
                <div className="p-4 bg-white border border-[#ece3d4] rounded-xl shadow-sm">
                  <p className="text-sm text-[#4a3b2c] leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Key Findings */}
              {result.key_findings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[#c89f70]" />
                    <h3 className="text-xs font-bold text-[#4a3b2c] uppercase tracking-wider">Key Findings</h3>
                  </div>
                  <div className="space-y-2">
                    {result.key_findings.map((finding, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white border border-[#ece3d4] rounded-xl shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#8c7b6c] shrink-0" />
                        <p className="text-sm text-[#4a3b2c] leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {result.risks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-[#4a3b2c] uppercase tracking-wider">Risks</h3>
                  </div>
                  <div className="space-y-2">
                    {result.risks.map((risk, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2"></div>
                        <p className="text-sm text-[#4a3b2c] leading-relaxed">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-[#c89f70]" />
                    <h3 className="text-xs font-bold text-[#4a3b2c] uppercase tracking-wider">Recommended Actions</h3>
                  </div>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white border border-[#ece3d4] rounded-xl shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-[#c89f70]">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-[#4a3b2c] leading-relaxed pt-0.5">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#f5efe6]">
                <div className="p-3 bg-[#fdfaf6] border border-[#ece3d4] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8c7b6c]" />
                    <p className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">Data Confidence</p>
                  </div>
                  <p className="text-sm font-bold text-[#4a3b2c]">{result.confidence}</p>
                </div>
                <div className="p-3 bg-[#fdfaf6] border border-[#ece3d4] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#8c7b6c]" />
                    <p className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider">Data Sources</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.data_sources_used.length > 0 ? (
                      result.data_sources_used.map((source, idx) => (
                        <span key={idx} className="text-[10px] font-medium text-[#4a3b2c] bg-white px-1.5 py-0.5 rounded border border-[#ece3d4]">
                          {source.replace('_tool', '').replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium text-[#8c7b6c]">None</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <span className="text-[10px] font-medium text-[#8c7b6c] uppercase tracking-wider text-center flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  AI reasoning grounded in verified marketing data
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#f5efe6]">
              <button
                onClick={() => {
                  setResult(null);
                  setQuestion("");
                }}
                className="w-full px-4 py-3 bg-[#fdfaf6] border border-[#ece3d4] rounded-xl text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] hover:bg-white transition-colors shadow-sm"
              >
                Ask another question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
