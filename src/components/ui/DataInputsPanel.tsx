import { Database, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface DataInput {
  id: string;
  name: string;
  source: string;
  lastUpdated: string;
  status: 'current' | 'stale' | 'missing';
  recordCount?: number;
}

interface DataInputsPanelProps {
  title: string;
  inputs: DataInput[];
}

export function DataInputsPanel({ title, inputs }: DataInputsPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Database size={16} className="text-gray-500" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {inputs.map((input) => (
          <div key={input.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm text-gray-900">{input.name}</div>
              <div className="text-xs text-gray-500">{input.source}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={10} />
                  {input.lastUpdated}
                </div>
                {input.recordCount && (
                  <div className="text-xs text-gray-400">{input.recordCount.toLocaleString()} records</div>
                )}
              </div>
              <div
                className={clsx(
                  'p-1 rounded-full',
                  input.status === 'current' && 'bg-green-100',
                  input.status === 'stale' && 'bg-yellow-100',
                  input.status === 'missing' && 'bg-red-100'
                )}
              >
                {input.status === 'current' && <CheckCircle size={14} className="text-green-600" />}
                {input.status === 'stale' && <AlertTriangle size={14} className="text-yellow-600" />}
                {input.status === 'missing' && <AlertTriangle size={14} className="text-red-600" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Module-specific data inputs
export const linearDataInputs: DataInput[] = [
  { id: 'nrld', name: 'NRLD Quarter-Hour Data', source: 'Nielsen', lastUpdated: '2 hours ago', status: 'current', recordCount: 1250000 },
  { id: 'ue', name: 'Universe Estimates', source: 'Nielsen March 2026', lastUpdated: '5 days ago', status: 'current', recordCount: 450 },
  { id: 'psp', name: 'Program Schedule', source: 'PSP Feed', lastUpdated: '1 hour ago', status: 'current', recordCount: 8500 },
  { id: 'factors', name: 'Methodology Factors', source: 'Research Team', lastUpdated: '2 weeks ago', status: 'current', recordCount: 120 },
];

export const ddlDataInputs: DataInput[] = [
  { id: 'videoamp', name: 'VideoAmp Impressions', source: 'VideoAmp API', lastUpdated: '4 hours ago', status: 'current', recordCount: 2500000 },
  { id: 'nielsen_ddl', name: 'Nielsen Advanced Audiences', source: 'Nielsen', lastUpdated: '6 hours ago', status: 'current', recordCount: 1800000 },
  { id: 'comscore', name: 'Comscore Data', source: 'Comscore', lastUpdated: '48 hours ago', status: 'stale', recordCount: 950000 },
  { id: 'lake5', name: 'Lake5 Segments', source: 'Lake5', lastUpdated: '12 hours ago', status: 'current', recordCount: 320000 },
];

export const digitalDataInputs: DataInput[] = [
  { id: 'adviews', name: 'Ad Views Historical', source: 'Ad Views Platform', lastUpdated: '1 hour ago', status: 'current', recordCount: 15000000 },
  { id: 'op1', name: 'Operative One Orders', source: 'OP1 API', lastUpdated: '30 min ago', status: 'current', recordCount: 45000 },
  { id: 'pressure', name: 'Pressure Inventory', source: 'Internal', lastUpdated: '2 hours ago', status: 'current', recordCount: 12000 },
  { id: 'freewheel', name: 'FreeWheel Placements', source: 'FreeWheel API', lastUpdated: '1 hour ago', status: 'current', recordCount: 8500 },
];

export const financeDataInputs: DataInput[] = [
  { id: 'ratecard', name: 'Rate Cards', source: 'Pricing System', lastUpdated: '1 week ago', status: 'current', recordCount: 2400 },
  { id: 'stewardship', name: 'Stewardship Liability', source: 'Stewardship Team', lastUpdated: '1 day ago', status: 'current', recordCount: 15000 },
  { id: 'sap', name: 'SAP Actuals', source: 'SAP', lastUpdated: '3 days ago', status: 'stale', recordCount: 85000 },
  { id: 'pricing', name: 'Pricing Guidance', source: 'Planning Team', lastUpdated: '2 weeks ago', status: 'current', recordCount: 180 },
  { id: 'linear_fcst', name: 'Linear Forecast (Input)', source: 'Linear Module', lastUpdated: '4 hours ago', status: 'current', recordCount: 25000 },
  { id: 'ddl_fcst', name: 'DDL Forecast (Input)', source: 'DDL Module', lastUpdated: '6 hours ago', status: 'current', recordCount: 18000 },
  { id: 'digital_fcst', name: 'Digital Forecast (Input)', source: 'Digital Module', lastUpdated: '2 hours ago', status: 'current', recordCount: 42000 },
];
