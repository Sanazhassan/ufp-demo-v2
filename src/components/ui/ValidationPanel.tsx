import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import type { ValidationResult } from '../../types';

interface ValidationPanelProps {
  title: string;
  validations: ValidationResult[];
  onRevalidate?: () => void;
  collapsed?: boolean;
}

export function ValidationPanel({ title, validations, onRevalidate, collapsed = false }: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const passCount = validations.filter((v) => v.status === 'pass').length;
  const failCount = validations.filter((v) => v.status === 'fail').length;
  const warningCount = validations.filter((v) => v.status === 'warning').length;

  const overallStatus = failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass';

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium text-gray-900">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            {passCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle size={12} /> {passCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle size={12} /> {warningCount}
              </span>
            )}
            {failCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <XCircle size={12} /> {failCount}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              overallStatus === 'pass' && 'bg-green-100 text-green-700',
              overallStatus === 'warning' && 'bg-yellow-100 text-yellow-700',
              overallStatus === 'fail' && 'bg-red-100 text-red-700'
            )}
          >
            {overallStatus === 'pass' ? 'All Passed' : overallStatus === 'warning' ? 'Warnings' : 'Action Required'}
          </span>
          {onRevalidate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRevalidate();
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <RefreshCw size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {validations.map((validation) => (
            <div key={validation.id} className="px-4 py-2">
              <div
                className={clsx(
                  'flex items-center justify-between cursor-pointer',
                  validation.affectedRecords > 0 && 'cursor-pointer'
                )}
                onClick={() => validation.affectedRecords > 0 && toggleItem(validation.id)}
              >
                <div className="flex items-center gap-2">
                  {validation.status === 'pass' && <CheckCircle size={14} className="text-green-500" />}
                  {validation.status === 'warning' && <AlertTriangle size={14} className="text-yellow-500" />}
                  {validation.status === 'fail' && <XCircle size={14} className="text-red-500" />}
                  <span className="text-sm text-gray-700">{validation.checkName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {validation.affectedRecords > 0 && (
                    <span className="text-xs text-gray-500">{validation.affectedRecords} records</span>
                  )}
                  {validation.affectedRecords > 0 && (
                    expandedItems.has(validation.id) ? (
                      <ChevronDown size={14} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400" />
                    )
                  )}
                </div>
              </div>
              {expandedItems.has(validation.id) && (
                <div className="mt-2 ml-6 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  {validation.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
