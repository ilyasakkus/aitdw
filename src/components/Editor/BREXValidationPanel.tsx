import { BREXValidationResult } from '@/lib/s1000d/brex';

interface BREXValidationPanelProps {
  validationResult: BREXValidationResult;
}

export default function BREXValidationPanel({ validationResult }: BREXValidationPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (validationResult.isValid) {
    return null;
  }

  return (
    <div className="p-2">
      <div className="text-xs font-semibold uppercase text-gray-500 mb-1">BREX Validation</div>
      <div className="space-y-1">
        {validationResult.violations.map((violation, index) => (
          <div
            key={index}
            className={`p-1.5 rounded text-xs ${getSeverityColor(violation.rule.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-medium">{violation.rule.id}: </span>
                <span>{violation.rule.message}</span>
              </div>
              <span className="opacity-75 ml-2">{violation.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
