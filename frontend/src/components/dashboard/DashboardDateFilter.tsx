import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export type DatePreset = '7days' | '30days' | '90days' | 'custom';

interface DashboardDateFilterProps {
  preset: DatePreset;
  startDate: string;
  endDate: string;
  onChange: (preset: DatePreset, start: string, end: string) => void;
}

export function DashboardDateFilter({ preset, startDate, endDate, onChange }: DashboardDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate.split('T')[0]);
  const [customEnd, setCustomEnd] = useState(endDate.split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (p: DatePreset) => {
    if (p === 'custom') {
      onChange(p, startDate, endDate);
      return;
    }
    setIsOpen(false);
    
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
    onChange('custom', new Date(customStart).toISOString(), new Date(customEnd).toISOString());
  };

  const getPresetLabel = () => {
    switch (preset) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      case 'custom': return `${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
    }
  };

  return (
    <div className="relative z-20">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white border border-[#ece3d4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#4a3b2c] cursor-pointer hover:border-[#c89f70] hover:bg-[#fdfaf6] transition-all shadow-sm"
      >
        <Calendar className="w-4 h-4 text-[#c89f70] mr-2" />
        {getPresetLabel()}
        <ChevronDown className={`w-4 h-4 text-[#8c7b6c] ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#ece3d4] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b border-[#ece3d4] bg-[#fdfaf6]">
            {(['7days', '30days', '90days'] as DatePreset[]).map(p => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === p ? 'bg-[#c89f70]/10 text-[#c89f70]' : 'text-[#4a3b2c] hover:bg-white'
                }`}
              >
                {p === '7days' ? 'Last 7 Days' : p === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
            <button
              onClick={() => handlePreset('custom')}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                preset === 'custom' ? 'bg-[#c89f70]/10 text-[#c89f70]' : 'text-[#4a3b2c] hover:bg-white'
              }`}
            >
              Custom Range
            </button>
          </div>

          {preset === 'custom' && (
            <div className="p-4 bg-white space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8c7b6c] uppercase mb-1">Start Date</label>
                <input 
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full border border-[#ece3d4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c89f70]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8c7b6c] uppercase mb-1">End Date</label>
                <input 
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full border border-[#ece3d4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c89f70]"
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button 
                onClick={applyCustom}
                className="w-full bg-[#c89f70] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#b08558] transition-colors shadow-sm"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
