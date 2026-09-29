import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { WorkforceSummary } from '../../api/workforceApi';

export function WorkforceHealthOverview({ summary }: { summary: WorkforceSummary }) {
  let bgColor = 'bg-gray-50';
  let borderColor = 'border-gray-200';
  let textColor = 'text-gray-700';
  let iconBg = 'bg-gray-100';
  let Icon = CheckCircle2;
  let description = '';

  if (summary.status === 'HEALTHY') {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    textColor = 'text-green-800';
    iconBg = 'bg-green-100';
    Icon = CheckCircle2;
    description = 'Workforce metrics are operating within expected boundaries.';
  } else if (summary.status === 'WATCH') {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    textColor = 'text-yellow-800';
    iconBg = 'bg-yellow-100';
    Icon = AlertTriangle;
    description = 'Some metrics indicate conditions requiring review.';
  } else if (summary.status === 'ATTENTION') {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-800';
    iconBg = 'bg-red-100';
    Icon = AlertOctagon;
    description = 'Critical workforce metrics require immediate attention.';
  }

  return (
    <div className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-center h-full ${bgColor} ${borderColor}`}>
      <div className="flex items-start">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4 ${iconBg} ${textColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-xl font-black mb-1 ${textColor}`}>
            {summary.status}
          </h3>
          <p className={`text-sm font-medium mb-3 opacity-90 ${textColor}`}>
            {description}
          </p>
          {summary.reasons && summary.reasons.length > 0 && (
            <ul className={`text-xs space-y-1 font-medium opacity-80 ${textColor} list-disc ml-4`}>
              {summary.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
