import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';

export function ReorderRecommendations({ recommendations }: { recommendations: any[] }) {
  const navigate = useNavigate();
  // Filter out NONE priority and sort implicitly by taking top ones (backend already sorts by priority)
  const displayRecs = recommendations.filter(r => r.priority !== 'NONE').slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece3d4] shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-[#c89f70]" />
        <h3 className="text-lg font-bold text-[#4a3b2c]">Smart Reorder Recommendations</h3>
      </div>
      
      {displayRecs.length === 0 ? (
        <p className="text-[#8c7b6c] text-sm italic">All items are sufficiently stocked.</p>
      ) : (
        <div className="space-y-4">
          {displayRecs.map((rec) => (
            <div key={rec.inventory_item_id} className="p-4 border border-[#ece3d4] rounded-xl bg-[#fdfaf6]">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-[#4a3b2c]">{rec.ingredient_name}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  rec.priority === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-200' :
                  rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {rec.priority}
                </span>
              </div>
              
              <div className="bg-white border border-[#ece3d4] p-3 rounded-lg mb-3">
                <p className="text-xs text-[#8c7b6c] font-medium mb-1">Recommended Reorder:</p>
                <p className="text-lg font-extrabold text-[#c89f70]">
                  {parseFloat(rec.recommended_quantity).toFixed(1)} <span className="text-sm font-bold">{rec.unit}</span>
                </p>
              </div>

              <p className="text-xs text-[#8c7b6c] mb-4 leading-relaxed">
                Stock will run out before supplier delivery completes in {rec.lead_time_days} days.
              </p>
              
              <button 
                onClick={() => navigate(`/inventory/${rec.inventory_item_id}`)}
                className="w-full flex items-center justify-center space-x-1 text-sm font-bold text-[#8c7b6c] hover:text-[#4a3b2c] py-2 border border-[#ece3d4] rounded-lg bg-white transition-colors hover:shadow-sm"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
