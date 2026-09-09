import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, MessageSquare, ListTodo, Activity } from 'lucide-react';
import { investigateInventory } from '../../api/inventoryApi';

export function InventoryAiPanel({ detail }: { detail: any }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    "Why is this running low?",
    "Analyze consumption pattern",
    "Explain reorder recommendation",
    "What happens if I don't reorder?"
  ];

  const loadingSteps = [
    "Checking current inventory metrics...",
    "Analyzing consumption patterns...",
    "Evaluating reorder risk...",
    "Preparing recommendations..."
  ];

  // Simulate loading steps for visual feedback
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
      }, 1500); // Progress to next step every 1.5s
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
      const response = await investigateInventory(
        detail.id,
        "Analyze specific ingredient inventory risk",
        q
      );
      setResult(response);
    } catch (err) {
      setError("Unable to complete inventory analysis right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQuestion('');
  };

  return (
    <div className="bg-white p-0 rounded-2xl border border-[#ece3d4] shadow-sm flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[#ece3d4] bg-[#fdfaf6] flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#c89f70]" />
          <h3 className="font-bold text-[#4a3b2c]">AI Inventory Investigation</h3>
        </div>
        {result && (
          <button onClick={handleReset} className="text-xs font-bold text-[#8c7b6c] hover:text-[#4a3b2c] transition-colors mt-2 sm:mt-0">
            New Investigation
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col">
        {!result && !loading && (
          <div className="flex flex-col">
            <p className="text-sm text-[#8c7b6c] mb-6 leading-relaxed">
              Analyze stock risk, consumption patterns, reorder decisions, and operational issues for <strong className="text-[#4a3b2c]">{detail.ingredient_name}</strong>.
            </p>

            <div className="space-y-3">
              <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Quick Questions</p>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(prompt)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#ece3d4] rounded-xl text-sm font-medium text-[#4a3b2c] hover:border-[#c89f70] hover:bg-[#fdfaf6] hover:text-[#c89f70] transition-colors group shadow-sm hover:shadow"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-4 h-4 text-[#ece3d4] group-hover:text-[#c89f70] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-[#fdfaf6] border border-[#ece3d4] flex items-center justify-center mb-6 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#c89f70] animate-spin" />
            </div>
            <p className="text-[#4a3b2c] font-bold mb-8">AI Inventory Agent is investigating...</p>
            
            <div className="w-full max-w-sm space-y-3">
              {loadingSteps.map((step, idx) => (
                <div key={idx} className={`flex items-center text-sm ${idx < loadingStep ? 'text-green-600 font-medium' : idx === loadingStep ? 'text-[#4a3b2c] font-bold animate-pulse' : 'text-[#bbaaa0]'}`}>
                  {idx < loadingStep ? (
                    <CheckCircle2 className="w-4 h-4 mr-3 shrink-0" />
                  ) : idx === loadingStep ? (
                    <Activity className="w-4 h-4 mr-3 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 mr-3 rounded-full border-2 border-[#ece3d4] shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <div className="bg-white border-l-2 border-[#c89f70] pl-4 py-1 mb-2">
              <p className="text-xs text-[#8c7b6c] uppercase tracking-wider font-bold">Investigation Request</p>
              <p className="font-bold text-[#4a3b2c] italic">"{question}"</p>
            </div>

            <div className="bg-[#fdfaf6] p-5 rounded-xl border border-[#ece3d4]">
              <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-2 flex items-center">
                <MessageSquare className="w-3 h-3 mr-1.5" /> Summary
              </h4>
              <p className="text-sm text-[#4a3b2c] leading-relaxed">{result.summary}</p>
            </div>

            {result.key_findings && result.key_findings.length > 0 && (
              <div>
                <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-3 border-b border-[#ece3d4] pb-2">Key Findings</h4>
                <ul className="space-y-3 mt-3">
                  {result.key_findings.map((finding: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm text-[#4a3b2c]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c89f70] mr-3 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.risks && result.risks.length > 0 && (
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <h4 className="text-[10px] font-extrabold text-red-800 uppercase tracking-widest mb-3 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> Identified Risks
                </h4>
                <ul className="space-y-2 mt-2">
                  {result.risks.map((risk: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm text-red-900 font-medium">
                      <span className="mr-2">🔴</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="text-[10px] font-extrabold text-[#8c7b6c] uppercase tracking-widest mb-3 border-b border-[#ece3d4] pb-2 flex items-center">
                  <ListTodo className="w-3 h-3 mr-1.5" /> Recommended Actions
                </h4>
                <div className="space-y-2 mt-3">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start bg-white border border-[#ece3d4] p-3.5 rounded-xl shadow-sm">
                      <span className="text-[#c89f70] font-bold mr-3">{idx + 1}.</span>
                      <span className="text-sm font-bold text-[#4a3b2c]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-[#ece3d4] flex items-center justify-between">
              <span className="text-xs text-[#8c7b6c] flex items-center font-medium">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-green-600" />
                Verified Deterministic Data
              </span>
              {result.confidence && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c89f70] bg-[#fdfaf6] px-2 py-1 rounded border border-[#ece3d4]">
                  Confidence: {result.confidence}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        {(!loading && !result) && (
          <div className="pt-6 mt-2">
            <p className="text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Ask a custom question...</p>
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
                placeholder="Type your inventory question..."
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-[#ece3d4] shadow-inner rounded-xl text-sm focus:outline-none focus:border-[#c89f70] focus:ring-1 focus:ring-[#c89f70] disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#4a3b2c] text-white text-sm font-bold rounded-xl hover:bg-[#3d3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Analyze <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
