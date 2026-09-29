import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, CheckCircle2, Activity, ShieldAlert, Cpu, FileText, Target, Eye } from 'lucide-react';
import { investigateAudit, type AuditAgentResponse, type InvestigationOutletContext, type ManagementAction } from '../../api/auditAgentApi';
import type { StructuredEvidence } from '../../api/auditApi';



const ManagementActionCard = ({ rec }: { rec: ManagementAction | string }) => {
  if (typeof rec === 'string') {
    return (
      <div className="p-4 bg-white border border-[#ece3d4] shadow-sm rounded-xl text-sm font-medium text-[#4a3b2c]">
        {rec}
      </div>
    );
  }

  const { action, rationale, priority, supporting_evidence, expected_operational_effect, monitor } = rec;
  
  let badgeColor = 'bg-gray-50 text-gray-700 border-gray-200';
  if (priority === 'HIGH') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  if (priority === 'MEDIUM') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  if (priority === 'LOW') badgeColor = 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="bg-white border border-[#ece3d4] shadow-sm rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col space-y-3">
        {/* Header: Action + Priority */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <h5 className="font-bold text-[#4a3b2c] text-base leading-snug">{action}</h5>
          {priority && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${badgeColor}`}>
              {priority} PRIORITY
            </span>
          )}
        </div>
        
        {/* Rationale */}
        {rationale && (
          <p className="text-sm text-[#4a3b2c] leading-relaxed">
            {rationale}
          </p>
        )}
      </div>

      {/* Sub-sections */}
      <div className="bg-[#fdfaf6] border-t border-[#ece3d4] p-4 flex flex-col space-y-4">
        {/* Supporting Evidence */}
        {supporting_evidence && supporting_evidence.length > 0 && (
          <div>
            <h6 className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-2 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Supporting Evidence
            </h6>
            <ul className="space-y-1.5">
              {supporting_evidence.map((ev: string, idx: number) => (
                <li key={idx} className="text-xs text-[#5c4d3c] flex items-start leading-relaxed">
                  <span className="mr-2 text-[#c89f70]">&#8226;</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expected Operational Effect */}
        {expected_operational_effect && (
          <div>
            <h6 className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-1.5 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5" /> Expected Operational Effect
            </h6>
            <p className="text-xs text-[#5c4d3c] leading-relaxed ml-5">
              {expected_operational_effect}
            </p>
          </div>
        )}

        {/* Monitor */}
        {monitor && (
          <div>
            <h6 className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-1.5 flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Monitor
            </h6>
            <p className="text-xs text-[#5c4d3c] leading-relaxed ml-5 font-medium">
              {monitor}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export interface InvestigationContext {
  type: 'general' | 'signal' | 'alert';
  title?: string;
  description?: string;
  outletId?: number | null;
  domainA?: string;
  domainB?: string;
  evidence?: string[];
  structured_evidence?: StructuredEvidence[] | null;
  outlet_context?: InvestigationOutletContext | null;
  severity?: string;
  domain?: string;
}

interface AuditAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  context: InvestigationContext;
}

const loadingSteps = [
  "Reviewing verified business signals...",
  "Structuring findings...",
  "Preparing investigation..."
];

export function AuditAiPanel({ isOpen, onClose, startDate, endDate, context }: AuditAiPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Clear result if date context changes, to avoid showing stale findings.
  useEffect(() => {
    setResult(null);
    setError(null);
    setQuestion("");
  }, [startDate, endDate, context]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    "What requires management attention?",
    "What cross-domain signals matter most?",
    "What operational issues should management investigate?",
    "Compare operational health across outlets and highlight meaningful differences."
  ];

  const handleAnalyze = async (query: string) => {
    if (!query.trim() || loading) return;
    
    setQuestion(query);
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 1500);

    let objective = "Investigate franchise operational intelligence.";
    if (context.type === 'signal') objective = "Investigate a detected cross-domain signal.";
    if (context.type === 'alert') objective = "Investigate a detected operational alert.";

    try {
      const response = await investigateAudit({
        objective,
        user_question: query,
        outlet_id: context.outletId || null,
        start_date: startDate,
        end_date: endDate,
        structured_evidence: context.structured_evidence,
        outlet_context: context.outlet_context
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while running the investigation.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(3);
    }
  };

  const handleTargetedInvestigation = () => {
    if (context.type === 'signal') {
      let evidenceText = '';
      if (context.structured_evidence && context.structured_evidence.length > 0) {
        evidenceText = context.structured_evidence.map(se => {
          return `${se.title} (${se.domain}):\n` + se.metrics.map(m => `  - ${m.label}: ${m.value}${m.unit ? ' ' + m.unit : ''}${m.status ? ' [' + m.status + ']' : ''}`).join('\n');
        }).join('\n\n');
      } else {
        evidenceText = (context.evidence || []).map(e => '- ' + e).join('\n');
      }

      const q = `Investigate this detected cross-domain signal.
Signal type: ${context.title}
Outlet: ${context.outletId || 'Franchise-wide'}

Evidence:
${evidenceText}

Explain the verified evidence, related operational signals, and areas that management should investigate. Do not assume causation.`;
      handleAnalyze(q);
    } else if (context.type === 'alert') {
      const q = `Investigate this detected alert.
Domain: ${context.domain}
Severity: ${context.severity}
Title: ${context.title}
Description: ${context.description}

Explain the verified evidence and related operational context that management should investigate. Do not assume causation.`;
      handleAnalyze(q);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#4a3b2c]/20 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#fdfaf6] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4a3b2c] to-[#604e3c] p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center">
                Audit Intelligence AI
                <span className="ml-3 text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/90 uppercase tracking-widest font-extrabold bg-white/10">
                  Agent
                </span>
              </h3>
              <p className="text-white/70 text-sm mt-0.5">
                Investigating {context.type === 'general' ? 'Franchise Operations' : context.type === 'signal' ? 'Cross-Domain Signal' : 'Operational Alert'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close investigation panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white flex flex-col">
          
          {/* Pre-Investigation State */}
          {!result && !loading && (
            <div className="flex-1 flex flex-col">
              
              {context.type !== 'general' && (
                <div className="bg-[#fdfaf6] border border-[#ece3d4] p-5 rounded-2xl mb-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-[#c89f70]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b6c]">Target Context</span>
                  </div>
                  <h4 className="font-bold text-[#4a3b2c] text-lg mb-2">{context.title}</h4>
                  {context.description && <p className="text-sm font-medium text-[#5c4d3c] mb-3">{context.description}</p>}
                  
                  {context.evidence && context.evidence.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-[#ece3d4]">
                      <p className="text-xs font-bold uppercase text-[#8c7b6c] mb-2">Verified Evidence</p>
                      <ul className="space-y-1">
                        {context.evidence.map((ev, i) => (
                          <li key={i} className="text-sm text-[#4a3b2c] flex items-start">
                            <span className="mr-2 text-[#c89f70]">•</span>
                            <span className="font-medium opacity-90">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleTargetedInvestigation}
                    className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-[#4a3b2c] text-white text-sm font-bold rounded-xl hover:bg-[#3d3228] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#c89f70]"
                  >
                    Run Investigation <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {context.type === 'general' && (
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3">Quick Investigations</p>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnalyze(prompt)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white border border-[#ece3d4] rounded-xl text-sm font-medium text-[#4a3b2c] hover:border-[#c89f70] hover:bg-[#fdfaf6] hover:text-[#c89f70] transition-colors group shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-[#c89f70]"
                    >
                      <span className="pr-4">{prompt}</span>
                      <ArrowRight className="w-4 h-4 text-[#ece3d4] group-hover:text-[#c89f70] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-[#f5efe6]">
                <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3">Custom Question</p>
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleAnalyze(question); }} 
                  className="flex flex-col space-y-3"
                >
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about franchise operations..."
                    disabled={loading}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#fdfaf6] border border-[#ece3d4] shadow-inner rounded-xl text-sm focus:outline-none focus:border-[#c89f70] focus:ring-1 focus:ring-[#c89f70] disabled:opacity-50 transition-all text-[#4a3b2c] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="w-full flex items-center justify-center px-4 py-3 bg-[#4a3b2c] text-white text-sm font-bold rounded-xl hover:bg-[#3d3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-[#c89f70]"
                  >
                    Investigate <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 rounded-2xl bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mb-6 shadow-sm">
                <Loader2 className="w-10 h-10 text-[#c89f70] animate-spin" />
              </div>
              <p className="text-[#4a3b2c] font-bold text-lg mb-8 text-center">Audit AI is investigating...</p>
              
              <div className="w-full max-w-sm space-y-5">
                {loadingSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-center text-sm ${idx < loadingStep ? 'text-green-600 font-medium' : idx === loadingStep ? 'text-[#4a3b2c] font-bold animate-pulse' : 'text-[#bbaaa0]'}`}>
                    {idx < loadingStep ? (
                      <CheckCircle2 className="w-5 h-5 mr-4 shrink-0" />
                    ) : idx === loadingStep ? (
                      <Activity className="w-5 h-5 mr-4 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 mr-4 rounded-full border-2 border-[#ece3d4] shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="font-bold text-lg text-[#4a3b2c] mb-2">Investigation Failed</h4>
              <p className="text-sm font-medium text-red-600 mb-6">{error}</p>
              <button
                onClick={() => handleAnalyze(question)}
                className="px-6 py-2.5 bg-white border border-[#ece3d4] shadow-sm rounded-xl text-sm font-bold text-[#4a3b2c] hover:bg-[#fdfaf6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c89f70]"
              >
                Retry Investigation
              </button>
            </div>
          )}

          {/* Result State */}
          {result && !loading && !error && (
            <div className="flex flex-col space-y-6 pb-6 animate-in fade-in duration-500">
              
              {/* Confidence Badge */}
              <div className="flex justify-end">
                {result.confidence ? (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                    result.confidence === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    result.confidence === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    result.confidence === 'Low' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    Confidence: {result.confidence}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm bg-gray-50 text-gray-700 border-gray-200">
                    Confidence: Not specified
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#fdfaf6] border border-[#c89f70]/30 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3">AI Investigation Summary</h4>
                <p className="text-base text-[#4a3b2c] font-medium leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Attention Areas */}
              {result.attention_areas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3 flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Attention Areas
                  </h4>
                  <ul className="space-y-2">
                    {result.attention_areas.map((area, i) => (
                      <li key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-sm font-medium text-rose-900 flex items-start">
                        <span className="mr-2 opacity-60 mt-0.5">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cross Domain Signals */}
              {result.cross_domain_signals.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Related Signals
                  </h4>
                  <ul className="space-y-2">
                    {result.cross_domain_signals.map((signal, i) => (
                      <li key={i} className="p-3 bg-amber-50/30 border border-amber-100 rounded-xl text-sm font-medium text-[#5c4d3c] flex items-start">
                        <span className="mr-2 opacity-60 mt-0.5">•</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-3 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Management Recommendations
                </h4>
                {result.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {result.recommendations.map((rec, i) => (
                      <ManagementActionCard key={i} rec={rec} />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#fdfaf6] border border-[#ece3d4] border-dashed rounded-xl text-center">
                    <p className="text-sm font-medium text-[#8c7b6c]">No management actions were generated from the available evidence.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer (Trust & Safety / Sources) */}
        <div className="bg-[#fdfaf6] p-4 border-t border-[#ece3d4] shrink-0 text-center">
          <p className="text-[10px] uppercase font-bold text-[#8c7b6c] mb-2 tracking-wider">
            AI-generated investigation based on deterministic business data. Verify recommendations against underlying operational data.
          </p>
          {result && result.data_sources_used.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {result.data_sources_used.map((src, i) => (
                <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-[#ece3d4] text-[#8c7b6c] rounded-full uppercase tracking-wider shadow-sm">
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
