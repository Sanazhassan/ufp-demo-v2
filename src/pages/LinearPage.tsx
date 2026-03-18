import { useState, useMemo } from 'react';
import {
  Send,
  Upload,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { Header } from '../components/layout';
import { FilterRail, DataTable, StatusBadge, Badge } from '../components/ui';
import { ValidationPanel } from '../components/ui/ValidationPanel';
import { DataInputsPanel, linearDataInputs } from '../components/ui/DataInputsPanel';
import { TrendChart, WaterfallChart } from '../components/charts';
import { useAuthStore } from '../stores/authStore';
import { linearValidations } from '../data/validationData';
import {
  networks,
  demos,
  broadcastQuarters,
  sellingTitles,
  generateLinearForecasts,
  generateEnsembleForecast,
  generateVarianceWaterfall,
} from '../data/mockData';
import type { LinearForecast } from '../types';

export function LinearPage() {
  const { getPermission } = useAuthStore();
  const permission = getPermission('linear');
  
  const [forecasts, setForecasts] = useState<LinearForecast[]>(() => generateLinearForecasts());
  const ensembleForecast = useMemo(() => generateEnsembleForecast(90), []);
  const varianceData = useMemo(() => generateVarianceWaterfall(), []);
  
  const [filters, setFilters] = useState<Record<string, string[]>>({
    networks: [],
    demos: [],
    quarters: ['2026Q2'],
    methodology: ['ACM'],
  });

  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  const filterSections = [
    {
      id: 'networks',
      title: 'Network',
      options: networks.map((n) => ({ id: n.id, label: n.name })),
    },
    {
      id: 'demos',
      title: 'Demo',
      options: demos.map((d) => ({ id: d.id, label: d.name })),
    },
    {
      id: 'quarters',
      title: 'Broadcast Quarter',
      options: broadcastQuarters.map((q) => ({ id: q.id, label: q.label })),
    },
    {
      id: 'methodology',
      title: 'Methodology',
      options: [
        { id: 'ACM', label: 'ACM' },
        { id: 'C3', label: 'C3' },
        { id: 'C7', label: 'C7' },
        { id: 'ProgAvgLive', label: 'Program Avg Live' },
      ],
      multiSelect: false,
    },
  ];

  const filteredForecasts = useMemo(() => {
    return forecasts.filter((f) => {
      if (filters.networks.length > 0 && !filters.networks.includes(f.networkId)) return false;
      if (filters.demos.length > 0 && !filters.demos.includes(f.demoId)) return false;
      if (filters.quarters.length > 0 && !filters.quarters.includes(f.broadcastQuarter)) return false;
      if (filters.methodology.length > 0 && !filters.methodology.includes(f.methodology)) return false;
      return true;
    });
  }, [forecasts, filters]);

  const handleOverrideChange = (id: string, value: number) => {
    if (!permission.canEdit) return;
    setForecasts((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              override: value,
              final: value,
              overrideReason: 'Manual adjustment',
              status: 'draft',
            }
          : f
      )
    );
    setEditingCell(null);
  };

  const summaryStats = useMemo(() => {
    const total = filteredForecasts.reduce((sum, f) => sum + f.final, 0);
    const overridden = filteredForecasts.filter((f) => f.override !== undefined).length;
    const pending = filteredForecasts.filter((f) => f.status === 'pending_approval').length;
    return { total, overridden, pending, count: filteredForecasts.length };
  }, [filteredForecasts]);

  const columns = [
    {
      key: 'sellingTitleId',
      header: 'Selling Title',
      sortable: true,
      render: (value: unknown) => {
        const title = sellingTitles.find((t) => t.id === value);
        return <span className="font-medium">{title?.name || String(value)}</span>;
      },
    },
    {
      key: 'networkId',
      header: 'Network',
      sortable: true,
      render: (value: unknown) => {
        const network = networks.find((n) => n.id === value);
        return <>{network?.name || String(value)}</>;
      },
    },
    {
      key: 'demoId',
      header: 'Demo',
      sortable: true,
      render: (value: unknown) => {
        const demo = demos.find((d) => d.id === value);
        return <>{demo?.name || String(value)}</>;
      },
    },
    {
      key: 'baseline',
      header: 'Baseline',
      align: 'right' as const,
      sortable: true,
      render: (value: unknown) => (
        <span className="text-gray-500">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'override',
      header: 'Override',
      align: 'right' as const,
      render: (value: unknown, row: LinearForecast) => {
        if (!permission.canEdit) {
          return value !== undefined && value !== null ? (
            <span className={Number(value) > row.baseline ? 'text-green-600' : 'text-red-600'}>
              {Number(value).toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-300">-</span>
          );
        }
        const isEditing = editingCell?.id === row.id && editingCell?.field === 'override';
        if (isEditing) {
          return (
            <input
              type="number"
              className="input w-24 text-right text-sm"
              defaultValue={value as number || row.baseline}
              autoFocus
              onBlur={(e) => handleOverrideChange(row.id, parseInt(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOverrideChange(row.id, parseInt((e.target as HTMLInputElement).value));
                }
                if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
            />
          );
        }
        return (
          <button
            className="text-right w-full hover:bg-gray-100 rounded px-2 py-1"
            onClick={() => setEditingCell({ id: row.id, field: 'override' })}
          >
            {value !== undefined && value !== null ? (
              <span className={Number(value) > row.baseline ? 'text-green-600' : 'text-red-600'}>
                {Number(value).toLocaleString()}
              </span>
            ) : (
              <span className="text-gray-300">Click to edit</span>
            )}
          </button>
        );
      },
    },
    {
      key: 'final',
      header: 'Final',
      align: 'right' as const,
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'overrideReason',
      header: 'Reason',
      render: (value: unknown) =>
        value ? (
          <Badge variant="outline">{String(value)}</Badge>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: unknown) => <StatusBadge status={value as LinearForecast['status']} />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Traditional Linear Workspace"
        subtitle="Research review and override management"
        actions={
          <div className="flex items-center gap-2">
            <button 
              className="btn-secondary flex items-center gap-2"
              disabled={!permission.canEdit}
            >
              <RotateCcw size={16} />
              Reset Overrides
            </button>
            <button 
              className="btn-secondary flex items-center gap-2"
              disabled={!permission.canApprove}
            >
              {!permission.canApprove && <Lock size={14} />}
              <Send size={16} />
              Submit for Approval
            </button>
            <button 
              className="btn-primary flex items-center gap-2"
              disabled={!permission.canPublish}
            >
              {!permission.canPublish && <Lock size={14} />}
              <Upload size={16} />
              Publish to Iceberg
            </button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Filter Rail */}
        <FilterRail
          sections={filterSections}
          values={filters}
          onChange={(sectionId, selected) =>
            setFilters((prev) => ({ ...prev, [sectionId]: selected }))
          }
          onClearAll={() =>
            setFilters({ networks: [], demos: [], quarters: ['2026Q2'], methodology: ['ACM'] })
          }
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Data Inputs & Validation Panels */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DataInputsPanel title="Linear Data Sources" inputs={linearDataInputs} />
            <ValidationPanel 
              title="Linear Validation Gates" 
              validations={linearValidations}
              onRevalidate={() => console.log('Revalidating...')}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Impressions</div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.total.toLocaleString()}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Forecasts Shown</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.count}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Overridden</div>
              <div className="text-2xl font-bold text-yellow-600">{summaryStats.overridden}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Pending Approval</div>
              <div className="text-2xl font-bold text-blue-600">{summaryStats.pending}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="card-header">Ensemble Trend: Baseline vs Actuals</div>
              <div className="card-body">
                <TrendChart
                  data={ensembleForecast.baseline}
                  actuals={ensembleForecast.actuals}
                  showConfidence
                  showModels={false}
                  height={250}
                />
              </div>
            </div>
            <div className="card">
              <div className="card-header">Variance Decomposition</div>
              <div className="card-body">
                <WaterfallChart data={varianceData} height={250} />
              </div>
            </div>
          </div>

          {/* Editable Grid */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span>Forecast Override Grid</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {permission.canEdit ? (
                  <span>Click any Override cell to edit</span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Lock size={12} /> View only mode
                  </span>
                )}
              </div>
            </div>
            <DataTable
              data={filteredForecasts}
              columns={columns}
              pageSize={15}
              onRowClick={(row) => setSelectedRow(row.id)}
              selectedRowId={selectedRow || undefined}
              stickyHeader
            />
          </div>
        </div>
      </div>
    </div>
  );
}
