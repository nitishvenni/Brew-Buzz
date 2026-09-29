import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export type DatePreset = '7days' | '30days' | '90days' | 'custom';

interface WorkforceDateFilterProps {
  preset: DatePreset;
  startDate: string;
  endDate: string;
  onChange: (preset: DatePreset, start: string, end: string) => void;
}

export function WorkforceDateFilter({ preset, startDate, endDate, onChange }: WorkforceDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate.split('T')[0]);
  const [customEnd, setCustomEnd] = useState(endDate.split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (p: DatePreset) => {
    setIsOpen(false);
    if (p === 'custom') {
      onChange(p, startDate, endDate);
      return;
    }
    
    const end = new Date();
    let start = new Date();
    
    if (p === '7days') start = subDays(end, 6);
    if (p === '30days') start = subDays(end, 29);
    if (p === '90days') start = subDays(end, 89);

    onChange(p, startOfDay(start).toISOString(), end.toISOString());
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) {
      setError("Both dates are required");
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setError("Start date cannot be after end date");
      return;
    }
    setError(null);
    setIsOpen(false);
    // Convert YYYY-MM-DD to ISO string
    const startIso = new Date(customStart + "T00:00:00Z").toISOString();
    const endIso = new Date(customEnd + "T00:00:00Z").toISOString();
    onChange('custom', startIso, endIso);
  };

  const displayValue = preset === '7days' ? 'Last 7 Days' :
                       preset === '30days' ? 'Last 30 Days' :
                       preset === '90days' ? 'Last 90 Days' :
                       `Custom (${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')})`;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white border border-[#ece3d4] rounded-lg px-4 py-2 text-sm font-medium text-[#4a3b2c] hover:border-[#c89f70] transition-colors shadow-sm"
      >
        <Calendar className="w-4 h-4 text-[#8c7b6c] mr-2" />
        {displayValue}
        <ChevronDown className="w-4 h-4 text-[#8c7b6c] ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#ece3d4] p-4 z-50">
          <div className="flex flex-col space-y-2 mb-4">
            <button onClick={() => handlePreset('7days')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#fdfaf6] transition-colors ${preset === '7days' ? 'text-[#c89f70] bg-[#fdfaf6]' : 'text-[#4a3b2c]'}`}>Last 7 Days</button>
            <button onClick={() => handlePreset('30days')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#fdfaf6] transition-colors ${preset === '30days' ? 'text-[#c89f70] bg-[#fdfaf6]' : 'text-[#4a3b2c]'}`}>Last 30 Days</button>
            <button onClick={() => handlePreset('90days')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#fdfaf6] transition-colors ${preset === '90days' ? 'text-[#c89f70] bg-[#fdfaf6]' : 'text-[#4a3b2c]'}`}>Last 90 Days</button>
            <button onClick={() => handlePreset('custom')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#fdfaf6] transition-colors ${preset === 'custom' ? 'text-[#c89f70] bg-[#fdfaf6]' : 'text-[#4a3b2c]'}`}>Custom Range</button>
          </div>

          {preset === 'custom' && (
            <div className="pt-4 border-t border-[#ece3d4]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#8c7b6c] uppercase mb-1">Start Date</label>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full border border-[#ece3d4] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#c89f70]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7b6c] uppercase mb-1">End Date</label>
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full border border-[#ece3d4] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#c89f70]" />
                </div>
                {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                <button onClick={applyCustom} className="w-full bg-[#c89f70] hover:bg-[#b08558] text-white font-bold py-2 rounded-lg text-sm transition-colors mt-2">
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
