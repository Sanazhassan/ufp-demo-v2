import { useState, useMemo } from 'react';
import {
  Play,
  Save,
  GitCompare,
  Download,
  Plus,
  Lock,
} from 'lucide-react';
import { Header } from '../components/layout';
import { ScenarioBuilder, StatCard, StatGrid, Badge, Tabs, TabList, TabTrigger, TabContent } from '../components/ui';
import { ValidationPanel } from '../components/ui/ValidationPanel';
import { DataInputsPanel, financeDataInputs } from '../components/ui/DataInputsPanel';
import { WaterfallChart, DonutChart, BarChart } from '../components/charts';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { financeValidations } from '../data/validationData';
import {
  generateRevenueForecasts,
  generateLiabilityDrivers,
} from '../data/mockData';
import type { WaterfallItem } from '../types';

export function FinancePage() {
  const { scenarioLevers, setScenarioLever, resetScenarioLevers } = useAppStore();
  const { getPermission } = useAuthStore();
  const permission = getPermission('finance');

  const [scenarioName, setScenarioName] = useState('Base Case');
  const [compareMode, setCompareMode] = useState(false);

  const revenueForecast = useMemo(
    () => generateRevenueForecasts(scenarioLevers),
    [scenarioLevers]
  );

  const baselineRevenue = useMemo(() => generateRevenueForecasts(), []);
  const liabilityDrivers = useMemo(() => generateLiabilityDrivers(), []);

  const totals = useMemo(() => {
    const current = revenueForecast.reduce(
      (acc, r) => ({
        total: acc.total + r.totalRevenue,
        cash: acc.cash + r.cashRevenue,
        adu: acc.adu + r.aduRevenue,
        dr: acc.dr + r.drRevenue,
        programmatic: acc.programmatic + r.programmaticRevenue,
      }),
      { total: 0, cash: 0, adu: 0, dr: 0, programmatic: 0 }
    );

    const baseline = baselineRevenue.reduce((acc, r) => acc + r.totalRevenue, 0);
    const variance = current.total - baseline;
    const variancePct = (variance / baseline) * 100;

    return { ...current, baseline, variance, variancePct };
  }, [revenueForecast, baselineRevenue]);

  const revenueByType = [
    { label: 'Cash', value: Math.round((totals.cash / totals.total) * 100) },
    { label: 'ADU', value: Math.round((totals.adu / totals.total) * 100) },
    { label: 'DR', value: Math.round((totals.dr / totals.total) * 100) },
    { label: 'Programmatic', value: Math.round((totals.programmatic / totals.total) * 100) },
  ];

  const monthlyTrend = revenueForecast.map((r) => ({
    label: r.period,
    value: r.totalRevenue,
  }));

  const liabilityTotal = liabilityDrivers.reduce((a, b) => a + b.amount, 0);

  const scenarioWaterfall: WaterfallItem[] = useMemo(() => {
    const rateAdj = scenarioLevers.find((l) => l.id === 'rate_adj')?.value || 0;
    const selloutAdj = scenarioLevers.find((l) => l.id === 'sellout_adj')?.value || 0;
    const mixAdj = scenarioLevers.find((l) => l.id === 'linear_digital_mix')?.value || 0;
    const fillAdj = (scenarioLevers.find((l) => l.id === 'digital_fill')?.value || 85) - 85;

    return [
      { label: 'Baseline', value: totals.baseline, type: 'total' },
      {
        label: 'Rate Impact',
        value: Math.round(totals.baseline * (rateAdj / 100)),
        type: rateAdj >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Sellout Impact',
        value: Math.round(totals.baseline * (selloutAdj / 100) * 0.8),
        type: selloutAdj >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Mix Shift',
        value: Math.round(totals.baseline * (mixAdj / 100) * 0.3),
        type: mixAdj >= 0 ? 'positive' : 'negative',
      },
      {
        label: 'Digital Fill',
        value: Math.round(totals.baseline * (fillAdj / 100) * 0.15),
        type: fillAdj >= 0 ? 'positive' : 'negative',
      },
      { label: 'Scenario Total', value: totals.total, type: 'total' },
    ];
  }, [scenarioLevers, totals]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Finance APM Workspace"
        subtitle="Scenario studio and revenue projection"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => permission.canEdit && setScenarioName(e.target.value)}
              disabled={!permission.canEdit}
              className="input w-48"
              placeholder="Scenario name"
            />
            <button
              className={`btn-secondary flex items-center gap-2 ${
                compareMode ? 'bg-primary-50 text-primary-700' : ''
              }`}
              onClick={() => setCompareMode(!compareMode)}
            >
              <GitCompare size={16} />
              Compare
            </button>
            <button 
              className="btn-secondary flex items-center gap-2"
              disabled={!permission.canEdit}
            >
              {!permission.canEdit && <Lock size={14} />}
              <Save size={16} />
              Save Scenario
            </button>
            <div className="relative group">
              <button 
                className="btn-primary flex items-center gap-2"
                disabled={!permission.canPublish}
              >
                {!permission.canPublish && <Lock size={14} />}
                <Download size={16} />
                Export
              </button>
              {permission.canPublish && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Export to ZZ
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Export to WRR
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Export to ZBridge
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Publish to Iceberg
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Scenario Builder Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          {/* Data Inputs & Validation at top of sidebar */}
          <div className="space-y-4 mb-6">
            <DataInputsPanel title="Finance Data Sources" inputs={financeDataInputs} />
            <ValidationPanel 
              title="Finance Validations" 
              validations={financeValidations}
              onRevalidate={() => console.log('Revalidating Finance...')}
              collapsed
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <ScenarioBuilder
              levers={scenarioLevers}
              onLeverChange={permission.canEdit ? setScenarioLever : () => {}}
              onResetAll={permission.canEdit ? resetScenarioLevers : () => {}}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!permission.canEdit}
            >
              {!permission.canEdit && <Lock size={14} />}
              <Play size={16} />
              Run Scenario
            </button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Scenarios</h4>
            <div className="space-y-2">
              {['Base Case', 'Upside +5%', 'Conservative', 'Sports Heavy'].map((name) => (
                <button
                  key={name}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    scenarioName === name
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setScenarioName(name)}
                >
                  {name}
                </button>
              ))}
              {permission.canEdit && (
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 flex items-center gap-1">
                  <Plus size={14} />
                  New Scenario
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* KPI Tiles */}
          <StatGrid columns={5}>
            <StatCard
              title="Total Revenue"
              value={`$${(totals.total / 1e9).toFixed(2)}B`}
              change={totals.variancePct}
              changeLabel="vs baseline"
              variant={totals.variancePct >= 0 ? 'success' : 'danger'}
            />
            <StatCard
              title="Cash Revenue"
              value={`$${(totals.cash / 1e9).toFixed(2)}B`}
            />
            <StatCard
              title="ADU/Liability"
              value={`$${(totals.adu / 1e6).toFixed(0)}M`}
            />
            <StatCard
              title="Digital Revenue"
              value={`$${((totals.dr + totals.programmatic) / 1e6).toFixed(0)}M`}
            />
            <StatCard
              title="Avg CPM"
              value={`$${(revenueForecast.reduce((a, b) => a + b.cpm, 0) / 12).toFixed(2)}`}
            />
          </StatGrid>

          {/* Main Charts */}
          <Tabs defaultValue="projection" onChange={() => {}}>
            <TabList className="mt-6 mb-4">
              <TabTrigger value="projection">Revenue Projection</TabTrigger>
              <TabTrigger value="waterfall">Variance Waterfall</TabTrigger>
              <TabTrigger value="liability">Liability Transparency</TabTrigger>
            </TabList>

            <TabContent value="projection" className="grid grid-cols-3 gap-6">
              <div className="col-span-2 card">
                <div className="card-header">Monthly Revenue Projection</div>
                <div className="card-body">
                  <BarChart
                    data={monthlyTrend}
                    height={300}
                    valueFormat={(v) => `$${(v / 1e6).toFixed(0)}M`}
                  />
                </div>
              </div>
              <div className="card">
                <div className="card-header">Revenue Mix</div>
                <div className="card-body flex justify-center">
                  <DonutChart
                    data={revenueByType}
                    size={200}
                    centerValue={`$${(totals.total / 1e9).toFixed(1)}B`}
                    centerLabel="Total"
                  />
                </div>
              </div>
            </TabContent>

            <TabContent value="waterfall">
              <div className="card">
                <div className="card-header">Scenario Impact Waterfall</div>
                <div className="card-body">
                  <WaterfallChart data={scenarioWaterfall} height={350} />
                </div>
              </div>
            </TabContent>

            <TabContent value="liability">
              <div className="grid grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">Liability Drivers</div>
                  <div className="card-body">
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Total Liability</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${(liabilityTotal / 1e6).toFixed(1)}M
                      </div>
                    </div>

                    <div className="space-y-3">
                      {liabilityDrivers.map((driver) => (
                        <div key={driver.category} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {driver.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                ${(driver.amount / 1e6).toFixed(1)}M
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${driver.percentOfTotal}%` }}
                              />
                            </div>
                          </div>
                          <Badge
                            variant={
                              driver.trend === 'up'
                                ? 'danger'
                                : driver.trend === 'down'
                                ? 'success'
                                : 'default'
                            }
                          >
                            {driver.trend === 'up' ? '↑' : driver.trend === 'down' ? '↓' : '→'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">Finance vs Stewardship Reconciliation</div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Finance Liability</span>
                          <span className="font-medium">${(liabilityTotal / 1e6).toFixed(1)}M</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Stewardship Liability</span>
                          <span className="font-medium">
                            ${((liabilityTotal * 1.02) / 1e6).toFixed(1)}M
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Variance</span>
                            <span className="font-medium text-yellow-600">
                              ${((liabilityTotal * 0.02) / 1e6).toFixed(1)}M (2.0%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800 mb-2">Variance Explained</div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Timing difference: $0.2M</li>
                          <li>• Clearing methodology: $0.3M</li>
                          <li>• Demo mapping: $0.1M</li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-green-200 text-sm text-green-800">
                          <strong>Unexplained plug: $0.0M</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabContent>
          </Tabs>

          {/* Detailed Forecast Table */}
          <div className="card mt-6">
            <div className="card-header flex items-center justify-between">
              <span>Monthly Forecast Detail</span>
              {!permission.canEdit && (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <Lock size={12} /> View only mode
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-right">Cash</th>
                    <th className="text-right">ADU</th>
                    <th className="text-right">DR</th>
                    <th className="text-right">Programmatic</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">CPM</th>
                    <th className="text-right">Fill %</th>
                    <th className="text-right">Sellout %</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueForecast.map((r) => (
                    <tr key={r.period}>
                      <td className="font-medium">{r.period}</td>
                      <td className="text-right">${(r.cashRevenue / 1e6).toFixed(1)}M</td>
                      <td className="text-right">${(r.aduRevenue / 1e6).toFixed(1)}M</td>
                      <td className="text-right">${(r.drRevenue / 1e6).toFixed(1)}M</td>
                      <td className="text-right">${(r.programmaticRevenue / 1e6).toFixed(1)}M</td>
                      <td className="text-right font-medium">
                        ${(r.totalRevenue / 1e6).toFixed(1)}M
                      </td>
                      <td className="text-right">${r.cpm.toFixed(2)}</td>
                      <td className="text-right">{r.fillRate.toFixed(1)}%</td>
                      <td className="text-right">{r.selloutRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
