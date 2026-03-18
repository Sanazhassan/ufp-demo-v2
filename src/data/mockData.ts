import type {
  Network,
  Demo,
  TargetSegment,
  SellingTitle,
  BroadcastQuarter,
  ForecastPoint,
  ModelContribution,
  EnsembleForecast,
  LinearForecast,
  DDLForecast,
  DigitalForecast,
  ScenarioLever,
  RevenueForecast,
  LiabilityDriver,
  ValidationResult,
  AuditLogEntry,
  ForecastRun,
  AlertItem,
  WaterfallItem,
} from '../types';

// Helper functions
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomBetween(min, max));

// Generate date range
const generateDateRange = (startDate: Date, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Networks
export const networks: Network[] = [
  { id: 'abc', name: 'ABC', type: 'entertainment' },
  { id: 'nbc', name: 'NBC', type: 'entertainment' },
  { id: 'cbs', name: 'CBS', type: 'entertainment' },
  { id: 'fox', name: 'FOX', type: 'entertainment' },
  { id: 'espn', name: 'ESPN', type: 'sports' },
  { id: 'espn2', name: 'ESPN2', type: 'sports' },
  { id: 'fs1', name: 'FS1', type: 'sports' },
  { id: 'cnn', name: 'CNN', type: 'news' },
  { id: 'msnbc', name: 'MSNBC', type: 'news' },
  { id: 'foxnews', name: 'Fox News', type: 'news' },
];

// Demographics
export const demos: Demo[] = [
  { id: 'p2554', name: 'P25-54', ageRange: '25-54', gender: 'P' },
  { id: 'p1849', name: 'P18-49', ageRange: '18-49', gender: 'P' },
  { id: 'a2554', name: 'A25-54', ageRange: '25-54', gender: 'M' },
  { id: 'w2554', name: 'W25-54', ageRange: '25-54', gender: 'F' },
  { id: 'p1834', name: 'P18-34', ageRange: '18-34', gender: 'P' },
  { id: 'hh', name: 'HH', ageRange: 'All', gender: 'P' },
];

// Target Segments (DDL)
export const targetSegments: TargetSegment[] = [
  { id: 'auto_intend', name: 'Auto Intenders', category: 'Purchase Intent' },
  { id: 'luxury_shop', name: 'Luxury Shoppers', category: 'Shopping' },
  { id: 'health_cons', name: 'Health Conscious', category: 'Lifestyle' },
  { id: 'tech_early', name: 'Tech Early Adopters', category: 'Technology' },
  { id: 'travel_freq', name: 'Frequent Travelers', category: 'Travel' },
  { id: 'finance_inv', name: 'Active Investors', category: 'Finance' },
  { id: 'sports_fan', name: 'Sports Enthusiasts', category: 'Entertainment' },
  { id: 'stream_sub', name: 'Streaming Subscribers', category: 'Media' },
];

// Selling Titles
export const sellingTitles: SellingTitle[] = [
  { id: 'gma', name: 'Good Morning America', networkId: 'abc', daypart: 'Morning', isBreakout: true },
  { id: 'today', name: 'Today Show', networkId: 'nbc', daypart: 'Morning', isBreakout: true },
  { id: 'abc_prime', name: 'ABC Primetime', networkId: 'abc', daypart: 'Primetime', isBreakout: false },
  { id: 'nbc_prime', name: 'NBC Primetime', networkId: 'nbc', daypart: 'Primetime', isBreakout: false },
  { id: 'mnf', name: 'Monday Night Football', networkId: 'espn', daypart: 'Primetime', isBreakout: true },
  { id: 'snf', name: 'Sunday Night Football', networkId: 'nbc', daypart: 'Primetime', isBreakout: true },
  { id: 'cbs_late', name: 'CBS Late Night', networkId: 'cbs', daypart: 'Late Night', isBreakout: false },
  { id: 'fox_prime', name: 'FOX Primetime', networkId: 'fox', daypart: 'Primetime', isBreakout: false },
];

// Broadcast Quarters
export const broadcastQuarters: BroadcastQuarter[] = [
  { id: '2026Q1', year: 2026, quarter: 1, label: '2026 Q1', startDate: '2025-12-29', endDate: '2026-03-29' },
  { id: '2026Q2', year: 2026, quarter: 2, label: '2026 Q2', startDate: '2026-03-30', endDate: '2026-06-28' },
  { id: '2026Q3', year: 2026, quarter: 3, label: '2026 Q3', startDate: '2026-06-29', endDate: '2026-09-27' },
  { id: '2026Q4', year: 2026, quarter: 4, label: '2026 Q4', startDate: '2026-09-28', endDate: '2026-12-27' },
];

// Generate time series with seasonality
const generateTimeSeries = (
  length: number,
  baseValue: number,
  volatility: number,
  trend: number = 0,
  seasonalAmplitude: number = 0
): number[] => {
  const series: number[] = [];
  let value = baseValue;
  for (let i = 0; i < length; i++) {
    const seasonal = seasonalAmplitude * Math.sin((2 * Math.PI * i) / 7);
    const noise = (Math.random() - 0.5) * volatility * baseValue;
    value = value * (1 + trend) + seasonal + noise;
    series.push(Math.max(0, value));
  }
  return series;
};

// Generate Ensemble Forecast
export const generateEnsembleForecast = (days: number = 90): EnsembleForecast => {
  const dates = generateDateRange(new Date('2026-01-01'), days);
  const baseValue = 1000000;
  
  const arimaForecast = generateTimeSeries(days, baseValue, 0.05, 0.001, 50000);
  const prophetForecast = generateTimeSeries(days, baseValue * 1.02, 0.04, 0.0015, 60000);
  const xgboostForecast = generateTimeSeries(days, baseValue * 0.98, 0.06, 0.002, 45000);
  const lstmForecast = generateTimeSeries(days, baseValue * 1.01, 0.03, 0.0012, 55000);

  const weights = { ARIMA: 0.25, Prophet: 0.30, XGBoost: 0.25, LSTM: 0.20 };
  
  const baseline: ForecastPoint[] = dates.map((date, i) => {
    const value = arimaForecast[i] * weights.ARIMA +
                  prophetForecast[i] * weights.Prophet +
                  xgboostForecast[i] * weights.XGBoost +
                  lstmForecast[i] * weights.LSTM;
    const stdDev = value * 0.08;
    return {
      date,
      value: Math.round(value),
      lower80: Math.round(value - 1.28 * stdDev),
      upper80: Math.round(value + 1.28 * stdDev),
      lower95: Math.round(value - 1.96 * stdDev),
      upper95: Math.round(value + 1.96 * stdDev),
    };
  });

  const models: ModelContribution[] = [
    { model: 'ARIMA', weight: weights.ARIMA, mape: 4.2, rmse: 42000, contribution: arimaForecast },
    { model: 'Prophet', weight: weights.Prophet, mape: 3.8, rmse: 38000, contribution: prophetForecast },
    { model: 'XGBoost', weight: weights.XGBoost, mape: 4.5, rmse: 45000, contribution: xgboostForecast },
    { model: 'LSTM', weight: weights.LSTM, mape: 4.0, rmse: 40000, contribution: lstmForecast },
  ];

  const actuals: ForecastPoint[] = dates.slice(0, 30).map((date, i) => ({
    date,
    value: Math.round(baseline[i].value * randomBetween(0.95, 1.05)),
  }));

  return { baseline, models, final: baseline, actuals };
};

// Generate Linear Forecasts
export const generateLinearForecasts = (): LinearForecast[] => {
  const forecasts: LinearForecast[] = [];
  const statuses: LinearForecast['status'][] = ['draft', 'pending_approval', 'approved', 'published'];
  const methodologies: LinearForecast['methodology'][] = ['ACM', 'C3', 'C7', 'ProgAvgLive'];
  
  sellingTitles.forEach(title => {
    demos.slice(0, 4).forEach(demo => {
      broadcastQuarters.forEach(quarter => {
        const baseline = randomInt(500, 5000);
        const hasOverride = Math.random() > 0.7;
        const override = hasOverride ? baseline * randomBetween(0.9, 1.15) : undefined;
        
        forecasts.push({
          id: `${title.id}_${demo.id}_${quarter.id}`,
          networkId: title.networkId,
          sellingTitleId: title.id,
          demoId: demo.id,
          broadcastQuarter: quarter.id,
          methodology: methodologies[randomInt(0, methodologies.length)],
          baseline,
          override: override ? Math.round(override) : undefined,
          final: Math.round(override || baseline),
          overrideReason: hasOverride ? ['Schedule change', 'UE update', 'Editorial adjustment', 'Sports event'][randomInt(0, 4)] : undefined,
          status: statuses[randomInt(0, statuses.length)],
        });
      });
    });
  });
  
  return forecasts;
};

// Generate DDL Forecasts
export const generateDDLForecasts = (): DDLForecast[] => {
  const forecasts: DDLForecast[] = [];
  const sources: DDLForecast['measurementSource'][] = ['Nielsen', 'VideoAmp', 'Comscore'];
  
  networks.forEach(network => {
    targetSegments.forEach(segment => {
      sources.forEach(source => {
        ([1, 2, 3, 4] as const).forEach(horizon => {
          forecasts.push({
            id: `${network.id}_${segment.id}_${source}_Q${horizon}`,
            networkId: network.id,
            targetSegmentId: segment.id,
            measurementSource: source,
            quarterHorizon: horizon,
            forecastDate: new Date().toISOString().split('T')[0],
            impressions: randomInt(1000000, 50000000),
            mape: randomBetween(2, 8),
          });
        });
      });
    });
  });
  
  return forecasts;
};

// Generate Digital Forecasts
export const generateDigitalForecasts = (): DigitalForecast[] => {
  const brandSites = ['ESPN.com', 'ABC.com', 'Hulu', 'Disney+', 'FX Networks'];
  const siteSections = ['Homepage', 'Live Sports', 'On Demand', 'News', 'Entertainment'];
  const platforms = ['Desktop', 'Mobile Web', 'Mobile App', 'CTV', 'Tablet'];
  const forecasts: DigitalForecast[] = [];
  
  const dates = generateDateRange(new Date('2026-01-01'), 365);
  
  brandSites.forEach(brandSite => {
    siteSections.slice(0, 3).forEach(siteSection => {
      platforms.forEach(platform => {
        dates.filter((_, i) => i % 7 === 0).forEach(date => {
          const capacity = randomInt(500000, 5000000);
          const demand = randomInt(200000, capacity);
          forecasts.push({
            id: `${brandSite}_${siteSection}_${platform}_${date}`,
            brandSite,
            siteSection,
            platform,
            date,
            forecastedViews: randomInt(300000, capacity),
            capacity,
            allocatedDemand: demand,
            availableInventory: capacity - demand,
          });
        });
      });
    });
  });
  
  return forecasts.slice(0, 500);
};

// Default scenario levers
export const defaultScenarioLevers: ScenarioLever[] = [
  { id: 'rate_adj', name: 'Rate Adjustment', type: 'rate', value: 0, min: -20, max: 20, step: 0.5, unit: '%' },
  { id: 'sellout_adj', name: 'Sellout Adjustment', type: 'sellout', value: 0, min: -15, max: 15, step: 0.5, unit: '%' },
  { id: 'linear_digital_mix', name: 'Linear/Digital Mix Shift', type: 'mix', value: 0, min: -10, max: 10, step: 0.5, unit: '%' },
  { id: 'digital_fill', name: 'Digital Fill Assumption', type: 'fill', value: 85, min: 60, max: 100, step: 1, unit: '%' },
  { id: 'sports_volatility', name: 'Sports Volatility', type: 'sports', value: 1, min: 0.5, max: 1.5, step: 0.05, unit: 'factor' },
  { id: 'preemption_factor', name: 'News Preemption', type: 'preemption', value: 0, min: 0, max: 10, step: 0.5, unit: '%' },
];

// Generate Revenue Forecasts
export const generateRevenueForecasts = (levers: ScenarioLever[] = defaultScenarioLevers): RevenueForecast[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rateAdj = 1 + (levers.find(l => l.id === 'rate_adj')?.value || 0) / 100;
  const selloutAdj = 1 + (levers.find(l => l.id === 'sellout_adj')?.value || 0) / 100;
  
  return months.map((period, i) => {
    const seasonality = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI);
    const baseRevenue = 150000000 * seasonality;
    
    return {
      period,
      cashRevenue: Math.round(baseRevenue * 0.65 * rateAdj * selloutAdj),
      aduRevenue: Math.round(baseRevenue * 0.15 * rateAdj),
      drRevenue: Math.round(baseRevenue * 0.12 * rateAdj * selloutAdj),
      programmaticRevenue: Math.round(baseRevenue * 0.08 * rateAdj),
      totalRevenue: Math.round(baseRevenue * rateAdj * selloutAdj),
      soldUnits: randomInt(80000, 120000),
      deliveredUnits: randomInt(70000, 100000),
      leftToGoUnits: randomInt(10000, 30000),
      cpm: randomBetween(25, 45),
      fillRate: randomBetween(75, 95),
      selloutRate: randomBetween(70, 90) * selloutAdj,
    };
  });
};

// Liability Drivers
export const generateLiabilityDrivers = (): LiabilityDriver[] => [
  { category: 'Audience Shortfall', amount: 8500000, percentOfTotal: 32, trend: 'up' },
  { category: 'Demo Mismatch', amount: 5200000, percentOfTotal: 19, trend: 'stable' },
  { category: 'Delivery Gap', amount: 4800000, percentOfTotal: 18, trend: 'down' },
  { category: 'ADU Allocation', amount: 3900000, percentOfTotal: 15, trend: 'up' },
  { category: 'Clearing Variance', amount: 2600000, percentOfTotal: 10, trend: 'stable' },
  { category: 'Linear/Digital Offset', amount: 1600000, percentOfTotal: 6, trend: 'down' },
];

// Validation Results
export const generateValidationResults = (): ValidationResult[] => [
  { id: 'v1', category: 'audience', status: 'pass', checkName: 'NRLD Completeness', message: 'All networks and demos present', affectedRecords: 0 },
  { id: 'v2', category: 'audience', status: 'warning', checkName: 'VideoAmp Coverage', message: '3 networks missing data for W25-54', affectedRecords: 12 },
  { id: 'v3', category: 'schedule', status: 'pass', checkName: 'PSP Feed Freshness', message: 'Feed updated within 24 hours', affectedRecords: 0 },
  { id: 'v4', category: 'schedule', status: 'fail', checkName: 'Reschedule Conflicts', message: 'ESPN has 15 unresolved schedule conflicts', affectedRecords: 15 },
  { id: 'v5', category: 'ue', status: 'pass', checkName: 'UE Version Alignment', message: 'All networks using March 2026 UE', affectedRecords: 0 },
  { id: 'v6', category: 'digital', status: 'warning', checkName: 'Ad Views Freshness', message: 'Hulu data is 48 hours stale', affectedRecords: 500 },
  { id: 'v7', category: 'digital', status: 'pass', checkName: 'Pressure Inventory', message: 'All pressure inventory loaded', affectedRecords: 0 },
  { id: 'v8', category: 'finance', status: 'pass', checkName: 'Rate Card Currency', message: 'All rate cards current', affectedRecords: 0 },
  { id: 'v9', category: 'finance', status: 'fail', checkName: 'Stewardship Liability', message: 'Missing Q2 liability data', affectedRecords: 45 },
  { id: 'v10', category: 'finance', status: 'warning', checkName: 'SAP Actuals Sync', message: 'SAP data 3 days behind', affectedRecords: 120 },
];

// Audit Log Entries
export const generateAuditLog = (): AuditLogEntry[] => {
  const users = ['jsmith@company.com', 'mwilliams@company.com', 'agarcia@company.com', 'ljohnson@company.com'];
  const entries: AuditLogEntry[] = [];
  
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setHours(date.getHours() - i * 2);
    
    entries.push({
      id: `audit_${i}`,
      timestamp: date.toISOString(),
      user: users[randomInt(0, users.length)],
      action: ['create', 'update', 'approve', 'publish', 'override'][randomInt(0, 5)] as AuditLogEntry['action'],
      module: ['linear', 'ddl', 'digital', 'finance'][randomInt(0, 4)] as AuditLogEntry['module'],
      entityType: ['forecast', 'scenario', 'override', 'validation'][randomInt(0, 4)],
      entityId: `entity_${randomInt(1000, 9999)}`,
      changes: Math.random() > 0.5 ? [
        { field: 'value', oldValue: randomInt(100, 500), newValue: randomInt(100, 500) },
      ] : undefined,
      reason: Math.random() > 0.5 ? 'Quarterly review adjustment' : undefined,
    });
  }
  
  return entries;
};

// Forecast Runs
export const generateForecastRuns = (): ForecastRun[] => [
  { id: 'run_001', module: 'linear', inputSnapshotId: 'snap_2026_03_15', modelVersions: { ensemble: '2.1.0' }, status: 'completed', startedAt: '2026-03-15T08:00:00Z', completedAt: '2026-03-15T08:12:00Z', publishedAt: '2026-03-15T09:00:00Z' },
  { id: 'run_002', module: 'ddl', inputSnapshotId: 'snap_2026_03_15', modelVersions: { nielsen: '1.5.0', videoamp: '1.3.0' }, status: 'completed', startedAt: '2026-03-15T08:30:00Z', completedAt: '2026-03-15T08:45:00Z', publishedAt: '2026-03-15T09:15:00Z' },
  { id: 'run_003', module: 'digital', inputSnapshotId: 'snap_2026_03_15', modelVersions: { portfolio: '3.0.0', allocation: '2.2.0' }, status: 'completed', startedAt: '2026-03-15T09:00:00Z', completedAt: '2026-03-15T09:20:00Z' },
  { id: 'run_004', module: 'finance', inputSnapshotId: 'snap_2026_03_15', modelVersions: { apm: '4.1.0' }, status: 'running', startedAt: '2026-03-16T07:00:00Z' },
];

// Alerts
export const generateAlerts = (): AlertItem[] => [
  { id: 'alert_1', severity: 'critical', title: 'Schedule Conflict', message: 'ESPN has 15 unresolved Q2 schedule conflicts', module: 'linear', timestamp: new Date().toISOString(), dismissed: false },
  { id: 'alert_2', severity: 'warning', title: 'Stale Data', message: 'VideoAmp data is 48 hours behind', module: 'ddl', timestamp: new Date().toISOString(), dismissed: false },
  { id: 'alert_3', severity: 'warning', title: 'UE Change Detected', message: 'March UE update shows -2.3% P18-49 change', module: 'linear', timestamp: new Date().toISOString(), dismissed: false },
  { id: 'alert_4', severity: 'info', title: 'New Forecast Published', message: 'Q2 Linear forecast published successfully', module: 'linear', timestamp: new Date().toISOString(), dismissed: true },
];

// Waterfall data for variance decomposition
export const generateVarianceWaterfall = (): WaterfallItem[] => [
  { label: 'Prior Forecast', value: 185000000, type: 'total' },
  { label: 'Schedule Changes', value: -3500000, type: 'negative' },
  { label: 'UE Update', value: -2100000, type: 'negative' },
  { label: 'Model Update', value: 4200000, type: 'positive' },
  { label: 'Research Override', value: 1800000, type: 'positive' },
  { label: 'Sports Adjustment', value: 5500000, type: 'positive' },
  { label: 'Digital Mix', value: -1200000, type: 'negative' },
  { label: 'Current Forecast', value: 189700000, type: 'total' },
];

// Export aggregated mock data
export const mockData = {
  networks,
  demos,
  targetSegments,
  sellingTitles,
  broadcastQuarters,
  generateEnsembleForecast,
  generateLinearForecasts,
  generateDDLForecasts,
  generateDigitalForecasts,
  defaultScenarioLevers,
  generateRevenueForecasts,
  generateLiabilityDrivers,
  generateValidationResults,
  generateAuditLog,
  generateForecastRuns,
  generateAlerts,
  generateVarianceWaterfall,
};
