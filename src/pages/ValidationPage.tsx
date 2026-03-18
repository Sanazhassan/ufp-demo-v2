import { useState, useMemo } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Tabs, TabList, TabTrigger, TabContent, StatusBadge, Badge } from '../components/ui';
import { GaugeChart } from '../components/charts';
import { generateValidationResults } from '../data/mockData';
import type { ValidationResult } from '../types';

const categoryLabels: Record<string, string> = {
  audience: 'Audience Inputs',
  schedule: 'Schedule Inputs',
  ue: 'UE Version Inputs',
  digital: 'Digital Inputs',
  finance: 'Finance Inputs',
};

const categoryIcons: Record<string, React.ReactNode> = {
  audience: <Shield size={16} />,
  schedule: <Shield size={16} />,
  ue: <Shield size={16} />,
  digital: <Shield size={16} />,
  finance: <Shield size={16} />,
};

interface ValidationRowProps {
  result: ValidationResult;
  expanded: boolean;
  onToggle: () => void;
}

function ValidationRow({ result, expanded, onToggle }: ValidationRowProps) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <td className="w-8">
          {result.affectedRecords > 0 ? (
            expanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )
          ) : (
            <span className="w-4" />
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {result.status === 'pass' && <CheckCircle size={16} className="text-green-500" />}
            {result.status === 'warning' && <AlertTriangle size={16} className="text-yellow-500" />}
            {result.status === 'fail' && <XCircle size={16} className="text-red-500" />}
            <span className="font-medium">{result.checkName}</span>
          </div>
        </td>
        <td>
          <StatusBadge status={result.status} />
        </td>
        <td className="text-gray-600">{result.message}</td>
        <td className="text-right">
          {result.affectedRecords > 0 ? (
            <Badge variant={result.status === 'fail' ? 'danger' : 'warning'}>
              {result.affectedRecords} records
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      </tr>
      {expanded && result.affectedRecords > 0 && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-8 py-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Affected Records</h4>
                <button className="btn-secondary text-sm flex items-center gap-1">
                  <Download size={14} />
                  Export Query
                </button>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-600">
                SELECT * FROM validation_errors WHERE check_id = '{result.id}' AND status = '{result.status}'
              </div>
              <div className="mt-3 text-sm text-gray-500">
                <strong>Remediation hint:</strong>{' '}
                {result.status === 'fail'
                  ? 'This check must pass before publishing. Contact the data team for resolution.'
                  : 'This warning should be reviewed but does not block publishing.'}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ValidationPage() {
  const validationResults = useMemo(() => generateValidationResults(), []);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('audience');

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categorySummaries = useMemo(() => {
    const categories = ['audience', 'schedule', 'ue', 'digital', 'finance'];
    return categories.map((cat) => {
      const results = validationResults.filter((r) => r.category === cat);
      const pass = results.filter((r) => r.status === 'pass').length;
      const fail = results.filter((r) => r.status === 'fail').length;
      const warning = results.filter((r) => r.status === 'warning').length;
      const score = results.length > 0 ? Math.round((pass / results.length) * 100) : 100;
      return { category: cat, pass, fail, warning, total: results.length, score };
    });
  }, [validationResults]);

  const overallScore = useMemo(() => {
    const pass = validationResults.filter((r) => r.status === 'pass').length;
    return Math.round((pass / validationResults.length) * 100);
  }, [validationResults]);

  const canPublish = !validationResults.some((r) => r.status === 'fail');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Data Intake & Validation"
        subtitle="Validate all inputs before publishing forecasts"
        actions={
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} />
              Re-run Validation
            </button>
            <button
              className={`btn-primary flex items-center gap-2 ${
                !canPublish ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canPublish}
            >
              {canPublish ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {canPublish ? 'Ready to Publish' : 'Cannot Publish'}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {/* Overall Score */}
          <div className="card col-span-1">
            <div className="card-body flex flex-col items-center">
              <GaugeChart
                value={overallScore}
                title="Overall Health"
                thresholds={{ warning: 80, danger: 60 }}
              />
            </div>
          </div>

          {/* Category Scores */}
          {categorySummaries.map((summary) => (
            <div
              key={summary.category}
              className={`card cursor-pointer transition-all ${
                activeCategory === summary.category
                  ? 'ring-2 ring-primary-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setActiveCategory(summary.category)}
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabels[summary.category]}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{summary.score}%</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">{summary.pass} pass</span>
                    {summary.fail > 0 && (
                      <span className="text-red-600">{summary.fail} fail</span>
                    )}
                    {summary.warning > 0 && (
                      <span className="text-yellow-600">{summary.warning} warn</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Results Table */}
        <div className="card">
          <Tabs defaultValue={activeCategory} onChange={setActiveCategory}>
            <TabList className="px-4">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const summary = categorySummaries.find((s) => s.category === key);
                return (
                  <TabTrigger
                    key={key}
                    value={key}
                    icon={categoryIcons[key]}
                    badge={summary?.fail || summary?.warning ? `${(summary?.fail || 0) + (summary?.warning || 0)}` : undefined}
                  >
                    {label}
                  </TabTrigger>
                );
              })}
            </TabList>

            {Object.keys(categoryLabels).map((category) => (
              <TabContent key={category} value={category}>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="w-8"></th>
                        <th>Check Name</th>
                        <th className="w-24">Status</th>
                        <th>Message</th>
                        <th className="w-32 text-right">Affected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults
                        .filter((r) => r.category === category)
                        .map((result) => (
                          <ValidationRow
                            key={result.id}
                            result={result}
                            expanded={expandedRows.has(result.id)}
                            onToggle={() => toggleRow(result.id)}
                          />
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabContent>
            ))}
          </Tabs>
        </div>

        {/* Blocking Issues Alert */}
        {!canPublish && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-800">Publishing Blocked</h3>
                <p className="text-sm text-red-700 mt-1">
                  {validationResults.filter((r) => r.status === 'fail').length} critical validation
                  failure(s) must be resolved before forecasts can be published. Click on failed
                  checks above for remediation guidance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
