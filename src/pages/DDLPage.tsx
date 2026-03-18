import { useState, useMemo } from 'react';
import { Upload, RefreshCw, Eye, Lock } from 'lucide-react';
import { Header } from '../components/layout';
import { FilterRail, DataTable, Badge, Tabs, TabList, TabTrigger, TabContent, StatCard } from '../components/ui';
import { ValidationPanel } from '../components/ui/ValidationPanel';
import { DataInputsPanel, ddlDataInputs } from '../components/ui/DataInputsPanel';
import { BarChart, HeatmapChart, TrendChart, GaugeChart } from '../components/charts';
import { useAuthStore } from '../stores/authStore';
import { ddlValidations } from '../data/validationData';
import {
  networks,
  targetSegments,
  generateDDLForecasts,
  generateEnsembleForecast,
} from '../data/mockData';
import type { HeatmapCell } from '../types';

export function DDLPage() {
  const { getPermission } = useAuthStore();
  const permission = getPermission('ddl');

  const forecasts = useMemo(() => generateDDLForecasts(), []);
  const ensembleForecast = useMemo(() => generateEnsembleForecast(90), []);

  const [filters, setFilters] = useState<Record<string, string[]>>({
    networks: [],
    targets: [],
    sources: ['Nielsen'],
    horizon: ['1'],
  });

  const [compareMode, setCompareMode] = useState(false);

  const filterSections = [
    {
      id: 'networks',
      title: 'Network',
      options: networks.map((n) => ({ id: n.id, label: n.name })),
    },
    {
      id: 'targets',
      title: 'Target Segment',
      options: targetSegments.map((t) => ({ id: t.id, label: t.name })),
    },
    {
      id: 'sources',
      title: 'Measurement Source',
      options: [
        { id: 'Nielsen', label: 'Nielsen' },
        { id: 'VideoAmp', label: 'VideoAmp' },
        { id: 'Comscore', label: 'Comscore' },
      ],
      multiSelect: false,
    },
    {
      id: 'horizon',
      title: 'Quarter Horizon',
      options: [
        { id: '1', label: 'Q+1' },
        { id: '2', label: 'Q+2' },
        { id: '3', label: 'Q+3' },
        { id: '4', label: 'Q+4' },
      ],
      multiSelect: false,
    },
  ];

  const filteredForecasts = useMemo(() => {
    return forecasts.filter((f) => {
      if (filters.networks.length > 0 && !filters.networks.includes(f.networkId)) return false;
      if (filters.targets.length > 0 && !filters.targets.includes(f.targetSegmentId)) return false;
      if (filters.sources.length > 0 && !filters.sources.includes(f.measurementSource)) return false;
      if (filters.horizon.length > 0 && !filters.horizon.includes(String(f.quarterHorizon))) return false;
      return true;
    });
  }, [forecasts, filters]);

  const accuracyByNetwork = useMemo(() => {
    const grouped = new Map<string, number[]>();
    filteredForecasts.forEach((f) => {
      if (!grouped.has(f.networkId)) grouped.set(f.networkId, []);
      grouped.get(f.networkId)!.push(f.mape);
    });
    return Array.from(grouped.entries())
      .map(([networkId, mapes]) => ({
        label: networks.find((n) => n.id === networkId)?.name || networkId,
        value: mapes.reduce((a, b) => a + b, 0) / mapes.length,
      }))
      .sort((a, b) => a.value - b.value);
  }, [filteredForecasts]);

  const accuracyByTarget = useMemo(() => {
    const grouped = new Map<string, number[]>();
    filteredForecasts.forEach((f) => {
      if (!grouped.has(f.targetSegmentId)) grouped.set(f.targetSegmentId, []);
      grouped.get(f.targetSegmentId)!.push(f.mape);
    });
    return Array.from(grouped.entries())
      .map(([targetId, mapes]) => ({
        label: targetSegments.find((t) => t.id === targetId)?.name || targetId,
        value: mapes.reduce((a, b) => a + b, 0) / mapes.length,
      }))
      .sort((a, b) => a.value - b.value);
  }, [filteredForecasts]);

  const heatmapData: HeatmapCell[] = useMemo(() => {
    const cells: HeatmapCell[] = [];
    const networkIds = [...new Set(filteredForecasts.map((f) => f.networkId))].slice(0, 6);
    const targetIds = [...new Set(filteredForecasts.map((f) => f.targetSegmentId))].slice(0, 6);

    networkIds.forEach((networkId) => {
      targetIds.forEach((targetId) => {
        const matches = filteredForecasts.filter(
          (f) => f.networkId === networkId && f.targetSegmentId === targetId
        );
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
  }, [filteredForecasts]);

  const avgMape = useMemo(() => {
    if (filteredForecasts.length === 0) return 0;
    return filteredForecasts.reduce((a, b) => a + b.mape, 0) / filteredForecasts.length;
  }, [filteredForecasts]);

  const totalImpressions = useMemo(() => {
    return filteredForecasts.reduce((sum, f) => sum + f.impressions, 0);
  }, [filteredForecasts]);

  const networkCoverage = useMemo(() => {
    const covered = new Set(filteredForecasts.map((f) => f.networkId)).size;
    return (covered / networks.length) * 100;
  }, [filteredForecasts]);

  const targetCoverage = useMemo(() => {
    const covered = new Set(filteredForecasts.map((f) => f.targetSegmentId)).size;
    return (covered / targetSegments.length) * 100;
  }, [filteredForecasts]);

  const columns = [
    {
      key: 'networkId',
      header: 'Network',
      sortable: true,
      render: (value: unknown) => <>{networks.find((n) => n.id === value)?.name || String(value)}</>,
    },
    {
      key: 'targetSegmentId',
      header: 'Target Segment',
      sortable: true,
      render: (value: unknown) => {
        const target = targetSegments.find((t) => t.id === value);
        return (
          <div>
            <div className="font-medium">{target?.name || String(value)}</div>
            <div className="text-xs text-gray-500">{target?.category}</div>
          </div>
        );
      },
    },
    {
      key: 'measurementSource',
      header: 'Source',
      render: (value: unknown) => <Badge variant="outline">{String(value)}</Badge>,
    },
    {
      key: 'quarterHorizon',
      header: 'Horizon',
      align: 'center' as const,
      render: (value: unknown) => <>{`Q+${value}`}</>,
    },
    {
      key: 'impressions',
      header: 'Impressions',
      align: 'right' as const,
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'mape',
      header: 'MAPE',
      align: 'right' as const,
      sortable: true,
      render: (value: unknown) => {
        const mape = Number(value);
        const color = mape < 4 ? 'text-green-600' : mape < 6 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-medium ${color}`}>{mape.toFixed(1)}%</span>;
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Advanced Targeting Workspace"
        subtitle="Advanced target audience forecasting"
        actions={
          <div className="flex items-center gap-2">
            <button
              className={`btn-secondary flex items-center gap-2 ${
                compareMode ? 'bg-primary-50 text-primary-700' : ''
              }`}
              onClick={() => setCompareMode(!compareMode)}
            >
              <Eye size={16} />
              Compare Currencies
            </button>
            <button 
              className="btn-secondary flex items-center gap-2"
              disabled={!permission.canEdit}
            >
              <RefreshCw size={16} />
              Refresh Models
            </button>
            <button 
              className="btn-primary flex items-center gap-2"
              disabled={!permission.canPublish}
            >
              {!permission.canPublish && <Lock size={14} />}
              <Upload size={16} />
              Publish Forecast
            </button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <FilterRail
          sections={filterSections}
          values={filters}
          onChange={(sectionId, selected) =>
            setFilters((prev) => ({ ...prev, [sectionId]: selected }))
          }
          onClearAll={() =>
            setFilters({ networks: [], targets: [], sources: ['Nielsen'], horizon: ['1'] })
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Data Inputs & Validation Panels */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DataInputsPanel title="Advanced Targeting Data Sources" inputs={ddlDataInputs} />
            <ValidationPanel 
              title="Advanced Targeting Validation Gates" 
              validations={ddlValidations}
              onRevalidate={() => console.log('Revalidating Advanced Targeting...')}
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <StatCard
              title="Total Impressions"
              value={`${(totalImpressions / 1e9).toFixed(2)}B`}
              trend="up"
            />
            <StatCard
              title="Active Segments"
              value={(new Set(filteredForecasts.map((f) => f.targetSegmentId)).size).toString()}
            />
            <StatCard
              title="Average MAPE"
              value={`${avgMape.toFixed(1)}%`}
              variant={avgMape < 4 ? 'success' : avgMape < 6 ? 'warning' : 'danger'}
            />
            <div className="card p-4 flex items-center justify-center">
              <GaugeChart
                value={networkCoverage}
                title="Network Coverage"
                size={120}
                thresholds={{ warning: 70, danger: 50 }}
              />
            </div>
            <div className="card p-4 flex items-center justify-center">
              <GaugeChart
                value={targetCoverage}
                title="Target Coverage"
                size={120}
                thresholds={{ warning: 70, danger: 50 }}
              />
            </div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="accuracy">
            <TabList className="mb-4">
              <TabTrigger value="accuracy">Accuracy Dashboard</TabTrigger>
              <TabTrigger value="trend">Forecast Trend</TabTrigger>
              <TabTrigger value="heatmap">Network x Target Heatmap</TabTrigger>
            </TabList>

            <TabContent value="accuracy" className="grid grid-cols-2 gap-6 mb-6">
              <div className="card">
                <div className="card-header">MAPE by Network</div>
                <div className="card-body">
                  <BarChart
                    data={accuracyByNetwork.slice(0, 8)}
                    height={250}
                    horizontal
                    valueFormat={(v) => `${v.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="card">
                <div className="card-header">MAPE by Target Segment</div>
                <div className="card-body">
                  <BarChart
                    data={accuracyByTarget.slice(0, 8)}
                    height={250}
                    horizontal
                    valueFormat={(v) => `${v.toFixed(1)}%`}
                  />
                </div>
              </div>
            </TabContent>

            <TabContent value="trend" className="mb-6">
              <div className="card">
                <div className="card-header">Ensemble Forecast with Model Contributions</div>
                <div className="card-body">
                  <TrendChart
                    data={ensembleForecast.baseline}
                    actuals={ensembleForecast.actuals}
                    models={ensembleForecast.models}
                    showConfidence
                    showModels
                    height={350}
                  />
                </div>
              </div>
            </TabContent>

            <TabContent value="heatmap" className="mb-6">
              <div className="card">
                <div className="card-header">MAPE Heatmap: Network x Target</div>
                <div className="card-body">
                  <HeatmapChart
                    data={heatmapData}
                    height={350}
                    colorScheme="diverging"
                  />
                </div>
              </div>
            </TabContent>
          </Tabs>

          {/* Data Table */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span>Advanced Targeting Forecast Table</span>
              {!permission.canEdit && (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <Lock size={12} /> View only mode
                </span>
              )}
            </div>
            <DataTable
              data={filteredForecasts}
              columns={columns}
              pageSize={12}
              stickyHeader
            />
          </div>
        </div>
      </div>
    </div>
  );
}
