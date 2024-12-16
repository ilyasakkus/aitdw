import { BREXValidationResult } from '@/lib/s1000d/brex';

interface BREXValidationPanelProps {
  validationResult: BREXValidationResult;
}

export default function BREXValidationPanel({ validationResult }: BREXValidationPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">BREX Validation Results</h3>
      {validationResult.isValid ? (
        <p className="text-green-600 bg-green-100 p-2 rounded">Document complies with all business rules</p>
      ) : (
        <div>
          <p className="text-red-600 font-semibold mb-2">Business Rule Violations Found:</p>
          <div className="space-y-2">
            {validationResult.violations.map((violation, index) => (
              <div
                key={index}
                className={`p-3 rounded ${getSeverityColor(violation.rule.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium">{violation.rule.id}: </span>
                    <span>{violation.rule.message}</span>
                  </div>
                  <span className="text-sm opacity-75">at {violation.location}</span>
                </div>
                <div className="text-sm mt-1 opacity-75">
                  Context: {violation.rule.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
