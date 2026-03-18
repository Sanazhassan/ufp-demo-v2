// Core dimension types
export interface Network {
  id: string;
  name: string;
  type: 'entertainment' | 'sports' | 'news';
}

export interface Demo {
  id: string;
  name: string;
  ageRange: string;
  gender: 'M' | 'F' | 'P';
}

export interface TargetSegment {
  id: string;
  name: string;
  category: string;
}

export interface SellingTitle {
  id: string;
  name: string;
  networkId: string;
  daypart: string;
  isBreakout: boolean;
}

export interface BroadcastQuarter {
  id: string;
  year: number;
  quarter: number;
  label: string;
  startDate: string;
  endDate: string;
}

// Forecast types
export interface ForecastPoint {
  date: string;
  value: number;
  lower80?: number;
  upper80?: number;
  lower95?: number;
  upper95?: number;
}

export interface ModelContribution {
  model: 'ARIMA' | 'Prophet' | 'XGBoost' | 'LSTM';
  weight: number;
  mape: number;
  rmse: number;
  contribution: number[];
}

export interface EnsembleForecast {
  baseline: ForecastPoint[];
  models: ModelContribution[];
  final: ForecastPoint[];
  actuals?: ForecastPoint[];
}

export interface LinearForecast {
  id: string;
  networkId: string;
  sellingTitleId: string;
  demoId: string;
  broadcastQuarter: string;
  methodology: 'ACM' | 'C3' | 'C7' | 'ProgAvgLive';
  baseline: number;
  override?: number;
  final: number;
  overrideReason?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published';
}

export interface DDLForecast {
  id: string;
  networkId: string;
  targetSegmentId: string;
  measurementSource: 'Nielsen' | 'VideoAmp' | 'Comscore';
  quarterHorizon: 1 | 2 | 3 | 4;
  forecastDate: string;
  impressions: number;
  mape: number;
}

export interface DigitalForecast {
  id: string;
  brandSite: string;
  siteSection: string;
  platform: string;
  date: string;
  forecastedViews: number;
  capacity: number;
  allocatedDemand: number;
  availableInventory: number;
}

// Finance types
export interface ScenarioLever {
  id: string;
  name: string;
  type: 'rate' | 'sellout' | 'mix' | 'fill' | 'sports' | 'preemption';
  value: number;
  min: number;
  max: number;
  step: number;
  unit: '%' | '$' | 'factor';
  scope?: {
    networks?: string[];
    platforms?: string[];
    products?: string[];
    dateRange?: [string, string];
  };
}

export interface FinanceScenario {
  id: string;
  name: string;
  baselineId: string;
  levers: ScenarioLever[];
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
  createdBy: string;
}

export interface RevenueForecast {
  period: string;
  cashRevenue: number;
  aduRevenue: number;
  drRevenue: number;
  programmaticRevenue: number;
  totalRevenue: number;
  soldUnits: number;
  deliveredUnits: number;
  leftToGoUnits: number;
  cpm: number;
  fillRate: number;
  selloutRate: number;
}

export interface LiabilityDriver {
  category: string;
  amount: number;
  percentOfTotal: number;
  trend: 'up' | 'down' | 'stable';
}

// Validation types
export interface ValidationResult {
  id: string;
  category: 'audience' | 'schedule' | 'ue' | 'digital' | 'finance';
  status: 'pass' | 'fail' | 'warning';
  checkName: string;
  message: string;
  affectedRecords: number;
  details?: Record<string, unknown>;
}

// Audit types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'approve' | 'publish' | 'override';
  module: 'linear' | 'ddl' | 'digital' | 'finance';
  entityType: string;
  entityId: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  reason?: string;
}

export interface ForecastRun {
  id: string;
  module: 'linear' | 'ddl' | 'digital' | 'finance';
  inputSnapshotId: string;
  modelVersions: Record<string, string>;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  publishedAt?: string;
}

// UI State types
export interface FilterState {
  networks: string[];
  demos: string[];
  quarters: string[];
  methodology?: string;
  measurementSource?: string;
  dateRange?: [string, string];
}

export interface AlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  module: string;
  timestamp: string;
  dismissed: boolean;
}

// Waterfall chart data
export interface WaterfallItem {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
  color?: string;
}

// Heatmap data
export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  label?: string;
}
