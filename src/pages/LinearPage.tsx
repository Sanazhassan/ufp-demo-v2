import { useState, useMemo } from 'react';
import { Send, Upload, RotateCcw, Lock, RefreshCw, Eye } from 'lucide-react';
import { Header } from '../components/layout';
import { FilterRail, DataTable, StatusBadge, Badge, StatCard, Tabs, TabList, TabTrigger, TabContent } from '../components/ui';
import { ValidationPanel } from '../components/ui/ValidationPanel';
import { DataInputsPanel, linearDataInputs, ddlDataInputs } from '../components/ui/DataInputsPanel';
import { TrendChart, WaterfallChart, GaugeChart, BarChart, HeatmapChart } from '../components/charts';
import { useAuthStore } from '../stores/authStore';
import { linearValidations, ddlValidations } from '../data/validationData';
import {
  networks,
  demos,
  broadcastQuarters,
  sellingTitles,
  targetSegments,
  generateLinearForecasts,
  generateDDLForecasts,
  generateEnsembleForecast,
  generateVarianceWaterfall,
} from '../data/mockData';
import type { LinearForecast, HeatmapCell } from '../types';

export function LinearPage() {
  const { getPermission } = useAuthStore();
  const linearPermission = getPermission('linear');
  const ddlPermission = getPermission('ddl');
  
  const [activeTab, setActiveTab] = useState<'traditional' | 'advanced'>('traditional');
  
  // Traditional Linear State
  const [forecasts, setForecasts] = useState<LinearForecast[]>(() => generateLinearForecasts());
  const ensembleForecast = useMemo(() => generateEnsembleForecast(90), []);
  const varianceData = useMemo(() => generateVarianceWaterfall(), []);
  
  const [linearFilters, setLinearFilters] = useState<Record<string, string[]>>({
    networks: [],
    demos: [],
    quarters: ['2026Q2'],
    methodology: ['ACM'],
  });
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  // Advanced Targeting State
  const ddlForecasts = useMemo(() => generateDDLForecasts(), []);
  const [ddlFilters, setDdlFilters] = useState<Record<string, string[]>>({
    networks: [],
    targets: [],
    sources: ['Nielsen'],
    horizon: ['1'],
  });
  const [compareMode, setCompareMode] = useState(false);

  // Traditional Linear Filter Sections
  const linearFilterSections = [
    { id: 'networks', title: 'Network', options: networks.map((n) => ({ id: n.id, label: n.name })) },
    { id: 'demos', title: 'Demo', options: demos.map((d) => ({ id: d.id, label: d.name })) },
    { id: 'quarters', title: 'Broadcast Quarter', options: broadcastQuarters.map((q) => ({ id: q.id, label: q.label })) },
    { id: 'methodology', title: 'Methodology', options: [{ id: 'ACM', label: 'ACM' }, { id: 'C3', label: 'C3' }, { id: 'C7', label: 'C7' }, { id: 'ProgAvgLive', label: 'Program Avg Live' }], multiSelect: false },
  ];

  // Advanced Targeting Filter Sections
  const ddlFilterSections = [
    { id: 'networks', title: 'Network', options: networks.map((n) => ({ id: n.id, label: n.name })) },
    { id: 'targets', title: 'Target Segment', options: targetSegments.map((t) => ({ id: t.id, label: t.name })) },
    { id: 'sources', title: 'Measurement Source', options: [{ id: 'Nielsen', label: 'Nielsen' }, { id: 'VideoAmp', label: 'VideoAmp' }, { id: 'Comscore', label: 'Comscore' }], multiSelect: false },
    { id: 'horizon', title: 'Quarter Horizon', options: [{ id: '1', label: 'Q+1' }, { id: '2', label: 'Q+2' }, { id: '3', label: 'Q+3' }, { id: '4', label: 'Q+4' }], multiSelect: false },
  ];

  // Traditional Linear Computations
  const filteredForecasts = useMemo(() => {
    return forecasts.filter((f) => {
      if (linearFilters.networks.length > 0 && !linearFilters.networks.includes(f.networkId)) return false;
      if (linearFilters.demos.length > 0 && !linearFilters.demos.includes(f.demoId)) return false;
      if (linearFilters.quarters.length > 0 && !linearFilters.quarters.includes(f.broadcastQuarter)) return false;
      if (linearFilters.methodology.length > 0 && !linearFilters.methodology.includes(f.methodology)) return false;
      return true;
    });
  }, [forecasts, linearFilters]);

  const linearStats = useMemo(() => {
    const total = filteredForecasts.reduce((sum, f) => sum + f.final, 0);
    const baseline = filteredForecasts.reduce((sum, f) => sum + f.baseline, 0);
    const overridden = filteredForecasts.filter((f) => f.override !== undefined).length;
    const approved = filteredForecasts.filter((f) => f.status === 'approved' || f.status === 'published').length;
    const approvalRate = filteredForecasts.length > 0 ? (approved / filteredForecasts.length) * 100 : 0;
    const overrideRate = filteredForecasts.length > 0 ? (overridden / filteredForecasts.length) * 100 : 0;
    return { total, baseline, overridden, count: filteredForecasts.length, approvalRate, overrideRate };
  }, [filteredForecasts]);

  // Advanced Targeting Computations
  const filteredDdlForecasts = useMemo(() => {
    return ddlForecasts.filter((f) => {
      if (ddlFilters.networks.length > 0 && !ddlFilters.networks.includes(f.networkId)) return false;
      if (ddlFilters.targets.length > 0 && !ddlFilters.targets.includes(f.targetSegmentId)) return false;
      if (ddlFilters.sources.length > 0 && !ddlFilters.sources.includes(f.measurementSource)) return false;
      if (ddlFilters.horizon.length > 0 && !ddlFilters.horizon.includes(String(f.quarterHorizon))) return false;
      return true;
    });
  }, [ddlForecasts, ddlFilters]);

  const ddlStats = useMemo(() => {
    const totalImpressions = filteredDdlForecasts.reduce((sum, f) => sum + f.impressions, 0);
    const avgMape = filteredDdlForecasts.length > 0 ? filteredDdlForecasts.reduce((sum, f) => sum + f.mape, 0) / filteredDdlForecasts.length : 0;
    const networkCoverage = (new Set(filteredDdlForecasts.map(f => f.networkId)).size / networks.length) * 100;
    const targetCoverage = (new Set(filteredDdlForecasts.map(f => f.targetSegmentId)).size / targetSegments.length) * 100;
    return { totalImpressions, avgMape, networkCoverage, targetCoverage, count: filteredDdlForecasts.length };
  }, [filteredDdlForecasts]);

  const accuracyByNetwork = useMemo(() => {
    const grouped = new Map<string, number[]>();
    filteredDdlForecasts.forEach((f) => {
      if (!grouped.has(f.networkId)) grouped.set(f.networkId, []);
      grouped.get(f.networkId)!.push(f.mape);
    });
    return Array.from(grouped.entries())
      .map(([networkId, mapes]) => ({
        label: networks.find((n) => n.id === networkId)?.name || networkId,
        value: mapes.reduce((a, b) => a + b, 0) / mapes.length,
      }))
      .sort((a, b) => a.value - b.value);
  }, [filteredDdlForecasts]);

  const accuracyByTarget = useMemo(() => {
    const grouped = new Map<string, number[]>();
    filteredDdlForecasts.forEach((f) => {
      if (!grouped.has(f.targetSegmentId)) grouped.set(f.targetSegmentId, []);
      grouped.get(f.targetSegmentId)!.push(f.mape);
    });
    return Array.from(grouped.entries())
      .map(([targetId, mapes]) => ({
        label: targetSegments.find((t) => t.id === targetId)?.name || targetId,
        value: mapes.reduce((a, b) => a + b, 0) / mapes.length,
      }))
      .sort((a, b) => a.value - b.value);
  }, [filteredDdlForecasts]);

  const ddlEnsembleForecast = useMemo(() => generateEnsembleForecast(90), []);

  const heatmapData: HeatmapCell[] = useMemo(() => {
    const cells: HeatmapCell[] = [];
    const networkIds = [...new Set(filteredDdlForecasts.map((f) => f.networkId))].slice(0, 6);
    const targetIds = [...new Set(filteredDdlForecasts.map((f) => f.targetSegmentId))].slice(0, 6);
    networkIds.forEach((networkId) => {
      targetIds.forEach((targetId) => {
        const matches = filteredDdlForecasts.filter((f) => f.networkId === networkId && f.targetSegmentId === targetId);
        if (matches.length > 0) {
          const avgMape = matches.reduce((a, b) => a + b.mape, 0) / matches.length;
          cells.push({
            x: networks.find((n) => n.id === networkId)?.name || networkId,
            y: targetSegments.find((t) => t.id === targetId)?.name || targetId,
            value: avgMape,
            label: avgMape.toFixed(1),
          });
        }
      });
    });
    return cells;
  }, [filteredDdlForecasts]);

  const handleOverrideChange = (id: string, value: number) => {
    if (!linearPermission.canEdit) return;
    setForecasts((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, override: value, final: value, overrideReason: 'Manual adjustment', status: 'draft' }
          : f
      )
    );
    setEditingCell(null);
  };

  const linearColumns = [
    { key: 'sellingTitleId', header: 'Selling Title', sortable: true, render: (value: unknown) => {
      const title = sellingTitles.find((t) => t.id === value);
      return <span className="font-medium">{title?.name || String(value)}</span>;
    }},
    { key: 'networkId', header: 'Network', sortable: true, render: (value: unknown) => networks.find((n) => n.id === value)?.name || String(value) },
    { key: 'demoId', header: 'Demo', sortable: true, render: (value: unknown) => demos.find((d) => d.id === value)?.name || String(value) },
    { key: 'baseline', header: 'Baseline', align: 'right' as const, sortable: true, render: (value: unknown) => <span className="text-gray-500">{Number(value).toLocaleString()}</span> },
    { key: 'override', header: 'Override', align: 'right' as const, render: (value: unknown, row: LinearForecast) => {
      if (!linearPermission.canEdit) {
        return value !== undefined && value !== null ? (
          <span className={Number(value) > row.baseline ? 'text-green-600' : 'text-red-600'}>{Number(value).toLocaleString()}</span>
        ) : <span className="text-gray-300">-</span>;
      }
      const isEditing = editingCell?.id === row.id && editingCell?.field === 'override';
      if (isEditing) {
        return (
          <input type="number" className="input w-24 text-right text-sm" defaultValue={value as number || row.baseline} autoFocus
            onBlur={(e) => handleOverrideChange(row.id, parseInt(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleOverrideChange(row.id, parseInt((e.target as HTMLInputElement).value)); if (e.key === 'Escape') setEditingCell(null); }}
          />
        );
      }
      return (
        <button className="text-right w-full hover:bg-gray-100 rounded px-2 py-1" onClick={() => setEditingCell({ id: row.id, field: 'override' })}>
          {value !== undefined && value !== null ? (
            <span className={Number(value) > row.baseline ? 'text-green-600' : 'text-red-600'}>{Number(value).toLocaleString()}</span>
          ) : <span className="text-gray-300">Click to edit</span>}
        </button>
      );
    }},
    { key: 'final', header: 'Final', align: 'right' as const, sortable: true, render: (value: unknown) => <span className="font-medium">{Number(value).toLocaleString()}</span> },
    { key: 'overrideReason', header: 'Reason', render: (value: unknown) => value ? <Badge variant="outline">{String(value)}</Badge> : <span className="text-gray-300">-</span> },
    { key: 'status', header: 'Status', render: (value: unknown) => <StatusBadge status={value as LinearForecast['status']} /> },
  ];

  const ddlColumns = [
    { key: 'networkId', header: 'Network', sortable: true, render: (value: unknown) => networks.find((n) => n.id === value)?.name || String(value) },
    { key: 'targetSegmentId', header: 'Target Segment', sortable: true, render: (value: unknown) => {
      const target = targetSegments.find((t) => t.id === value);
      return <div><div className="font-medium">{target?.name || String(value)}</div><div className="text-xs text-gray-500">{target?.category}</div></div>;
    }},
    { key: 'measurementSource', header: 'Source', render: (value: unknown) => <Badge variant={value === 'Nielsen' ? 'primary' : value === 'VideoAmp' ? 'success' : 'secondary'}>{String(value)}</Badge> },
    { key: 'impressions', header: 'Impressions', align: 'right' as const, sortable: true, render: (value: unknown) => `${(Number(value) / 1e6).toFixed(2)}M` },
    { key: 'mape', header: 'MAPE', align: 'right' as const, sortable: true, render: (value: unknown) => {
      const mape = Number(value);
      return <span className={mape < 4 ? 'text-green-600' : mape < 6 ? 'text-yellow-600' : 'text-red-600'}>{mape.toFixed(2)}%</span>;
    }},
    { key: 'quarterHorizon', header: 'Horizon', align: 'center' as const, render: (value: unknown) => <Badge variant="outline">Q+{String(value)}</Badge> },
  ];

  const permission = activeTab === 'traditional' ? linearPermission : ddlPermission;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Linear Forecasting Workspace"
        subtitle={activeTab === 'traditional' ? 'Traditional research review and override management' : 'Advanced audience targeting forecasts'}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'traditional' ? (
              <>
                <button className="btn-secondary flex items-center gap-2" disabled={!permission.canEdit}><RotateCcw size={16} />Reset Overrides</button>
                <button className="btn-secondary flex items-center gap-2" disabled={!permission.canApprove}>{!permission.canApprove && <Lock size={14} />}<Send size={16} />Submit for Approval</button>
                <button className="btn-primary flex items-center gap-2" disabled={!permission.canPublish}>{!permission.canPublish && <Lock size={14} />}<Upload size={16} />Publish to Iceberg</button>
              </>
            ) : (
              <>
                <button className={`btn-secondary flex items-center gap-2 ${compareMode ? 'bg-primary-50 text-primary-700' : ''}`} onClick={() => setCompareMode(!compareMode)}><Eye size={16} />Compare Currencies</button>
                <button className="btn-secondary flex items-center gap-2" disabled={!permission.canEdit}><RefreshCw size={16} />Refresh Models</button>
                <button className="btn-primary flex items-center gap-2" disabled={!permission.canPublish}>{!permission.canPublish && <Lock size={14} />}<Upload size={16} />Publish Forecast</button>
              </>
            )}
          </div>
        }
      />

      {/* Tab Selector */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('traditional')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'traditional' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Traditional Linear
          </button>
          <button onClick={() => setActiveTab('advanced')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Advanced Targeting
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filter Rail */}
        <FilterRail
          sections={activeTab === 'traditional' ? linearFilterSections : ddlFilterSections}
          values={activeTab === 'traditional' ? linearFilters : ddlFilters}
          onChange={(sectionId, selected) => activeTab === 'traditional' 
            ? setLinearFilters((prev) => ({ ...prev, [sectionId]: selected }))
            : setDdlFilters((prev) => ({ ...prev, [sectionId]: selected }))
          }
          onClearAll={() => activeTab === 'traditional'
            ? setLinearFilters({ networks: [], demos: [], quarters: ['2026Q2'], methodology: ['ACM'] })
            : setDdlFilters({ networks: [], targets: [], sources: ['Nielsen'], horizon: ['1'] })
          }
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'traditional' ? (
            <>
              {/* Data Inputs & Validation Panels */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <DataInputsPanel title="Linear Data Sources" inputs={linearDataInputs} />
                <ValidationPanel title="Linear Validation Gates" validations={linearValidations} onRevalidate={() => console.log('Revalidating...')} />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <StatCard title="Total Forecast" value={`${(linearStats.total / 1e6).toFixed(0)}M`} trend="up" />
                <StatCard title="Baseline" value={`${(linearStats.baseline / 1e6).toFixed(0)}M`} />
                <StatCard title="Override Adjustments" value={`${linearStats.overridden}`} />
                <div className="card p-4 flex items-center justify-center">
                  <GaugeChart value={linearStats.approvalRate} title="Approval Rate" size={120} thresholds={{ warning: 70, danger: 50 }} />
                </div>
                <div className="card p-4 flex items-center justify-center">
                  <GaugeChart value={linearStats.overrideRate} title="Override Rate" size={120} thresholds={{ warning: 40, danger: 60 }} />
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <div className="card-header">Ensemble Trend: Baseline vs Actuals</div>
                  <div className="card-body"><TrendChart data={ensembleForecast.baseline} actuals={ensembleForecast.actuals} showConfidence showModels={false} height={250} /></div>
                </div>
                <div className="card">
                  <div className="card-header">Variance Decomposition</div>
                  <div className="card-body"><WaterfallChart data={varianceData} height={250} /></div>
                </div>
              </div>

              {/* Editable Grid */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <span>Forecast Override Grid</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {permission.canEdit ? <span>Click any Override cell to edit</span> : <span className="flex items-center gap-1 text-yellow-600"><Lock size={12} /> View only mode</span>}
                  </div>
                </div>
                <DataTable data={filteredForecasts} columns={linearColumns} pageSize={15} stickyHeader />
              </div>
            </>
          ) : (
            <>
              {/* Data Inputs & Validation Panels */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <DataInputsPanel title="Advanced Targeting Data Sources" inputs={ddlDataInputs} />
                <ValidationPanel title="Advanced Targeting Validation Gates" validations={ddlValidations} onRevalidate={() => console.log('Revalidating...')} />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <StatCard title="Total Impressions" value={`${(ddlStats.totalImpressions / 1e9).toFixed(2)}B`} trend="up" />
                <StatCard title="Active Segments" value={(new Set(filteredDdlForecasts.map((f) => f.targetSegmentId)).size).toString()} />
                <StatCard title="Average MAPE" value={`${ddlStats.avgMape.toFixed(1)}%`} variant={ddlStats.avgMape < 4 ? 'success' : ddlStats.avgMape < 6 ? 'warning' : 'danger'} />
                <div className="card p-4 flex items-center justify-center">
                  <GaugeChart value={ddlStats.networkCoverage} title="Network Coverage" size={120} thresholds={{ warning: 70, danger: 50 }} />
                </div>
                <div className="card p-4 flex items-center justify-center">
                  <GaugeChart value={ddlStats.targetCoverage} title="Target Coverage" size={120} thresholds={{ warning: 70, danger: 50 }} />
                </div>
              </div>

              {/* Charts with Tabs */}
              <Tabs defaultValue="accuracy">
                <TabList className="mb-4">
                  <TabTrigger value="accuracy">Accuracy Dashboard</TabTrigger>
                  <TabTrigger value="trend">Forecast Trend</TabTrigger>
                  <TabTrigger value="heatmap">Network x Target Heatmap</TabTrigger>
                </TabList>

                <TabContent value="accuracy" className="grid grid-cols-2 gap-6 mb-6">
                  <div className="card">
                    <div className="card-header">MAPE by Network</div>
                    <div className="card-body"><BarChart data={accuracyByNetwork.slice(0, 8)} height={250} horizontal valueFormat={(v) => `${v.toFixed(1)}%`} /></div>
                  </div>
                  <div className="card">
                    <div className="card-header">MAPE by Target Segment</div>
                    <div className="card-body"><BarChart data={accuracyByTarget.slice(0, 8)} height={250} horizontal valueFormat={(v) => `${v.toFixed(1)}%`} /></div>
                  </div>
                </TabContent>

                <TabContent value="trend" className="mb-6">
                  <div className="card">
                    <div className="card-header">Ensemble Forecast with Model Contributions</div>
                    <div className="card-body"><TrendChart data={ddlEnsembleForecast.baseline} actuals={ddlEnsembleForecast.actuals} models={ddlEnsembleForecast.models} showConfidence showModels height={350} /></div>
                  </div>
                </TabContent>

                <TabContent value="heatmap" className="mb-6">
                  <div className="card">
                    <div className="card-header">MAPE Heatmap: Network x Target</div>
                    <div className="card-body"><HeatmapChart data={heatmapData} height={350} colorScheme="diverging" /></div>
                  </div>
                </TabContent>
              </Tabs>

              {/* Data Table */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <span>Advanced Targeting Forecast Table</span>
                  {!permission.canEdit && <span className="flex items-center gap-1 text-sm text-yellow-600"><Lock size={12} /> View only mode</span>}
                </div>
                <DataTable data={filteredDdlForecasts} columns={ddlColumns} pageSize={12} stickyHeader />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
