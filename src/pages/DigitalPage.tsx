import { useState, useMemo } from 'react';
import { Play, Upload, Sliders, Lock } from 'lucide-react';
import { Header } from '../components/layout';
import { FilterRail, DataTable, Badge, Tabs, TabList, TabTrigger, TabContent, StatCard } from '../components/ui';
import { ValidationPanel } from '../components/ui/ValidationPanel';
import { DataInputsPanel, digitalDataInputs } from '../components/ui/DataInputsPanel';
import { TrendChart, BarChart, GaugeChart } from '../components/charts';
import { useAuthStore } from '../stores/authStore';
import { digitalValidations } from '../data/validationData';
import { generateDigitalForecasts, digitalBrandSites } from '../data/mockData';
import type { DigitalForecast, ForecastPoint } from '../types';

export function DigitalPage() {
  const { getPermission } = useAuthStore();
  const permission = getPermission('digital');

  const forecasts = useMemo(() => generateDigitalForecasts(), []);

  const [filters, setFilters] = useState<Record<string, string[]>>({
    brandSites: [],
    category: [],
    tier: [],
    platforms: [],
  });

  const [pressureInventoryEnabled, setPressureInventoryEnabled] = useState(true);
  const [allocationRunning, setAllocationRunning] = useState(false);

  const filterSections = [
    {
      id: 'brandSites',
      title: 'Brand/Site',
      options: digitalBrandSites.map((b) => ({
        id: b.name,
        label: b.name,
      })),
    },
    {
      id: 'category',
      title: 'Category',
      options: [...new Set(digitalBrandSites.map(b => b.category))].map((c) => ({
        id: c,
        label: c,
      })),
    },
    {
      id: 'tier',
      title: 'Tier',
      options: [
        { id: 'Premium', label: 'Premium' },
        { id: 'Standard', label: 'Standard' },
        { id: 'Niche', label: 'Niche' },
      ],
    },
    {
      id: 'platforms',
      title: 'Platform',
      options: ['Desktop', 'Mobile Web', 'Mobile App', 'CTV', 'Tablet', 'Smart TV'].map((p) => ({
        id: p,
        label: p,
      })),
    },
  ];

  const filteredForecasts = useMemo(() => {
    return forecasts.filter((f) => {
      if (filters.brandSites.length > 0 && !filters.brandSites.includes(f.brandSite)) return false;
      if (filters.platforms.length > 0 && !filters.platforms.includes(f.platform)) return false;
      // Filter by category and tier using brandSites lookup
      const brandInfo = digitalBrandSites.find(b => b.name === f.brandSite);
      if (filters.category.length > 0 && brandInfo && !filters.category.includes(brandInfo.category)) return false;
      if (filters.tier.length > 0 && brandInfo && !filters.tier.includes(brandInfo.tier)) return false;
      return true;
    });
  }, [forecasts, filters]);

  const aggregatedByBrandSite = useMemo(() => {
    const grouped = new Map<string, { views: number; capacity: number; demand: number }>();
    filteredForecasts.forEach((f) => {
      if (!grouped.has(f.brandSite)) {
        grouped.set(f.brandSite, { views: 0, capacity: 0, demand: 0 });
      }
      const g = grouped.get(f.brandSite)!;
      g.views += f.forecastedViews;
      g.capacity += f.capacity;
      g.demand += f.allocatedDemand;
    });
    return Array.from(grouped.entries())
      .map(([brandSite, data]) => {
        const brandInfo = digitalBrandSites.find(b => b.name === brandSite);
        return {
          label: brandSite,
          value: data.views,
          capacity: data.capacity,
          demand: data.demand,
          fillRate: (data.demand / data.capacity) * 100,
          category: brandInfo?.category || 'Other',
          tier: brandInfo?.tier || 'Standard',
          avgCPM: brandInfo?.avgCPM || 30,
          fillTarget: brandInfo?.fillTarget || 80,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredForecasts]);

  const portfolioTrend: ForecastPoint[] = useMemo(() => {
    const dateMap = new Map<string, number>();
    filteredForecasts.forEach((f) => {
      dateMap.set(f.date, (dateMap.get(f.date) || 0) + f.forecastedViews);
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 52)
      .map(([date, value]) => ({ date, value }));
  }, [filteredForecasts]);

  const summaryStats = useMemo(() => {
    const totalViews = filteredForecasts.reduce((a, b) => a + b.forecastedViews, 0);
    const totalCapacity = filteredForecasts.reduce((a, b) => a + b.capacity, 0);
    const totalDemand = filteredForecasts.reduce((a, b) => a + b.allocatedDemand, 0);
    const totalAvailable = filteredForecasts.reduce((a, b) => a + b.availableInventory, 0);
    return {
      totalViews,
      totalCapacity,
      totalDemand,
      totalAvailable,
      fillRate: (totalDemand / totalCapacity) * 100,
      utilizationRate: ((totalCapacity - totalAvailable) / totalCapacity) * 100,
    };
  }, [filteredForecasts]);

  const handleRunAllocation = () => {
    if (!permission.canEdit) return;
    setAllocationRunning(true);
    setTimeout(() => setAllocationRunning(false), 2000);
  };

  const columns = [
    { key: 'brandSite', header: 'Brand/Site', sortable: true },
    { key: 'siteSection', header: 'Section', sortable: true },
    { key: 'platform', header: 'Platform', render: (v: unknown) => <Badge variant="outline">{String(v)}</Badge> },
    { key: 'date', header: 'Date', sortable: true },
    {
      key: 'forecastedViews',
      header: 'Forecast',
      align: 'right' as const,
      sortable: true,
      render: (v: unknown) => Number(v).toLocaleString(),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      align: 'right' as const,
      render: (v: unknown) => Number(v).toLocaleString(),
    },
    {
      key: 'allocatedDemand',
      header: 'Demand',
      align: 'right' as const,
      render: (v: unknown) => Number(v).toLocaleString(),
    },
    {
      key: 'availableInventory',
      header: 'Available',
      align: 'right' as const,
      render: (v: unknown, row: DigitalForecast) => {
        const pct = (row.availableInventory / row.capacity) * 100;
        return (
          <span className={pct < 20 ? 'text-red-600 font-medium' : ''}>
            {Number(v).toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Digital Forecasting Workspace"
        subtitle="Portfolio forecast and allocation simulation"
        actions={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pressureInventoryEnabled}
                onChange={(e) => permission.canEdit && setPressureInventoryEnabled(e.target.checked)}
                disabled={!permission.canEdit}
                className="rounded border-gray-300 text-primary-600"
              />
              Include Pressure Inventory
            </label>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={handleRunAllocation}
              disabled={allocationRunning || !permission.canEdit}
            >
              <Play size={16} className={allocationRunning ? 'animate-spin' : ''} />
              {allocationRunning ? 'Running...' : 'Run Allocation'}
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
          onClearAll={() => setFilters({ brandSites: [], platforms: [] })}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Data Inputs & Validation Panels */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DataInputsPanel title="Digital Data Sources" inputs={digitalDataInputs} />
            <ValidationPanel 
              title="Digital Validation Gates" 
              validations={digitalValidations}
              onRevalidate={() => console.log('Revalidating Digital...')}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <StatCard
              title="Total Forecast Views"
              value={`${(summaryStats.totalViews / 1e9).toFixed(2)}B`}
              trend="up"
            />
            <StatCard
              title="Total Capacity"
              value={`${(summaryStats.totalCapacity / 1e9).toFixed(2)}B`}
            />
            <StatCard
              title="Allocated Demand"
              value={`${(summaryStats.totalDemand / 1e9).toFixed(2)}B`}
            />
            <div className="card p-4 flex items-center justify-center">
              <GaugeChart
                value={summaryStats.fillRate}
                title="Fill Rate"
                size={120}
                thresholds={{ warning: 75, danger: 90 }}
              />
            </div>
            <div className="card p-4 flex items-center justify-center">
              <GaugeChart
                value={summaryStats.utilizationRate}
                title="Utilization"
                size={120}
                thresholds={{ warning: 80, danger: 95 }}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="portfolio">
            <TabList className="mb-4">
              <TabTrigger value="portfolio">Portfolio Forecast</TabTrigger>
              <TabTrigger value="brands">Brand/Site Details</TabTrigger>
              <TabTrigger value="allocation">Allocation / Avails</TabTrigger>
            </TabList>

            <TabContent value="portfolio">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <div className="card-header">12-Month Portfolio Trend</div>
                  <div className="card-body">
                    <TrendChart data={portfolioTrend} showConfidence={false} height={280} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">Views by Brand/Site</div>
                  <div className="card-body">
                    <BarChart
                      data={aggregatedByBrandSite.slice(0, 6).map((d) => ({
                        label: d.label,
                        value: d.value,
                      }))}
                      height={280}
                      valueFormat={(v) => `${(v / 1e6).toFixed(1)}M`}
                    />
                  </div>
                </div>
              </div>
            </TabContent>

            <TabContent value="brands">
              <div className="card mb-6">
                <div className="card-header flex items-center justify-between">
                  <span>Brand/Site Performance Overview</span>
                  <span className="text-sm text-gray-500">{aggregatedByBrandSite.length} brands active</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Brand/Site</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Tier</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Forecast Views</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Capacity</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Demand</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Fill Rate</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Target</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Avg CPM</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aggregatedByBrandSite.map((brand) => {
                        const fillDiff = brand.fillRate - brand.fillTarget;
                        const status = fillDiff >= 0 ? 'On Track' : fillDiff > -10 ? 'At Risk' : 'Below Target';
                        const statusColor = fillDiff >= 0 ? 'text-green-600 bg-green-50' : fillDiff > -10 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                        return (
                          <tr key={brand.label} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{brand.label}</td>
                            <td className="px-4 py-3 text-gray-600">{brand.category}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={brand.tier === 'Premium' ? 'primary' : brand.tier === 'Standard' ? 'secondary' : 'outline'}>
                                {brand.tier}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">{(brand.value / 1e6).toFixed(1)}M</td>
                            <td className="px-4 py-3 text-right text-gray-600">{(brand.capacity / 1e6).toFixed(1)}M</td>
                            <td className="px-4 py-3 text-right text-gray-600">{(brand.demand / 1e6).toFixed(1)}M</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${brand.fillRate >= brand.fillTarget ? 'bg-green-500' : brand.fillRate >= brand.fillTarget - 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(brand.fillRate, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{brand.fillRate.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">{brand.fillTarget}%</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">${brand.avgCPM.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Category Summary */}
              <div className="grid grid-cols-4 gap-4">
                {['Streaming', 'Sports', 'Entertainment', 'News'].map(category => {
                  const categoryBrands = aggregatedByBrandSite.filter(b => b.category === category);
                  const totalViews = categoryBrands.reduce((sum, b) => sum + b.value, 0);
                  const avgFill = categoryBrands.length > 0 ? categoryBrands.reduce((sum, b) => sum + b.fillRate, 0) / categoryBrands.length : 0;
                  const avgCPM = categoryBrands.length > 0 ? categoryBrands.reduce((sum, b) => sum + b.avgCPM, 0) / categoryBrands.length : 0;
                  return (
                    <div key={category} className="card p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">{category}</div>
                      <div className="text-xl font-bold text-gray-900">{(totalViews / 1e9).toFixed(2)}B views</div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{categoryBrands.length} brands</span>
                        <span>Avg Fill: {avgFill.toFixed(0)}%</span>
                        <span>CPM: ${avgCPM.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabContent>

            <TabContent value="allocation">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card col-span-2">
                  <div className="card-header flex items-center justify-between">
                    <span>Allocation Simulation</span>
                    <button 
                      className="text-sm text-primary-600 flex items-center gap-1"
                      disabled={!permission.canEdit}
                    >
                      <Sliders size={14} />
                      Configure Constraints
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Simulation Parameters</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Pressure Inventory:</span>{' '}
                          <span className="font-medium">
                            {pressureInventoryEnabled ? 'Included' : 'Excluded'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dummy Placements:</span>{' '}
                          <span className="font-medium text-green-600">Synced</span>
                        </div>
                        <div>
                          <span className="text-gray-500">FreeWheel API:</span>{' '}
                          <span className="font-medium text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {aggregatedByBrandSite.slice(0, 5).map((site) => (
                        <div key={site.label} className="flex items-center gap-4">
                          <div className="w-32 text-sm font-medium truncate">{site.label}</div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${site.fillRate}%` }}
                              />
                              <div
                                className="absolute top-0 h-full bg-yellow-400 opacity-50"
                                style={{
                                  left: `${site.fillRate}%`,
                                  width: `${Math.min(15, 100 - site.fillRate)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-20 text-right text-sm">
                            <span
                              className={
                                site.fillRate > 90
                                  ? 'text-red-600'
                                  : site.fillRate > 75
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }
                            >
                              {site.fillRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">Feasibility Check</div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Desktop: Allocatable
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          85% fill rate, 2.1M remaining capacity
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 font-medium">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                          CTV: Near Capacity
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          92% fill rate, consider geo broadening
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800 font-medium">
                          <span className="w-2 h-2 bg-red-500 rounded-full" />
                          Mobile App: Bottleneck
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Sports inventory constraint exceeded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabContent>
          </Tabs>

          {/* Data Table */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span>Digital Forecast Detail</span>
              {!permission.canEdit && (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <Lock size={12} /> View only mode
                </span>
              )}
            </div>
            <DataTable data={filteredForecasts} columns={columns} pageSize={12} stickyHeader />
          </div>
        </div>
      </div>
    </div>
  );
}
