import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Monitor,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Header } from '../components/layout';
import { useAuthStore } from '../stores/authStore';
import { generateLinearForecasts, generateDDLForecasts, generateDigitalForecasts, targetSegments, networks } from '../data/mockData';

export function HomePage() {
  const { currentUser, getPermission } = useAuthStore();

  // Generate real data from modules
  const linearData = useMemo(() => {
    const forecasts = generateLinearForecasts();
    const total = forecasts.reduce((sum, f) => sum + f.final, 0);
    const approved = forecasts.filter(f => f.status === 'approved' || f.status === 'published').length;
    const approvalRate = forecasts.length > 0 ? (approved / forecasts.length) * 100 : 0;
    return { total, count: forecasts.length, approvalRate };
  }, []);

  const ddlData = useMemo(() => {
    const forecasts = generateDDLForecasts();
    const totalImpressions = forecasts.reduce((sum, f) => sum + f.impressions, 0);
    const avgMape = forecasts.length > 0 ? forecasts.reduce((sum, f) => sum + f.mape, 0) / forecasts.length : 0;
    const networkCoverage = (new Set(forecasts.map(f => f.networkId)).size / networks.length) * 100;
    const targetCoverage = (new Set(forecasts.map(f => f.targetSegmentId)).size / targetSegments.length) * 100;
    return { totalImpressions, avgMape, networkCoverage, targetCoverage };
  }, []);

  const digitalData = useMemo(() => {
    const forecasts = generateDigitalForecasts();
    const totalViews = forecasts.reduce((sum, f) => sum + f.forecastedViews, 0);
    const totalCapacity = forecasts.reduce((sum, f) => sum + f.capacity, 0);
    const totalDemand = forecasts.reduce((sum, f) => sum + f.allocatedDemand, 0);
    const fillRate = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;
    return { totalViews, totalCapacity, totalDemand, fillRate };
  }, []);

  // Calculate totals - using CPM assumption for revenue conversion
  const avgCPM = 34.28;
  const linearRevenue = (linearData.total * avgCPM) / 1000;
  const ddlRevenue = (ddlData.totalImpressions * avgCPM * 0.8) / 1000; // 80% of CPM for DDL
  const digitalRevenue = (digitalData.totalViews * avgCPM * 1.2) / 1000; // 120% premium for digital
  const totalRevenue = linearRevenue + ddlRevenue + digitalRevenue;

  // Strategic KPIs for executive view
  const strategicMetrics = {
    totalRevenue: { value: (totalRevenue / 1e9).toFixed(2), unit: 'B', change: 3.2, label: 'Total Forecast Revenue', trend: 'up' },
    yoyGrowth: { value: 4.8, unit: '%', change: 1.2, label: 'YoY Growth', trend: 'up' },
    forecastAccuracy: { value: 96.2, unit: '%', change: 0.8, label: 'Forecast Accuracy', trend: 'up' },
    riskExposure: { value: 45, unit: 'M', change: -12, label: 'Risk Exposure', trend: 'down' },
  };

  // Combined Linear revenue (Traditional + Advanced Targeting)
  const combinedLinearRevenue = linearRevenue + ddlRevenue;
  const combinedLinearImpressions = linearData.total + ddlData.totalImpressions;

  const moduleStatus = [
    {
      name: 'Linear',
      path: '/linear',
      icon: TrendingUp,
      color: 'bg-blue-500',
      revenue: `$${(combinedLinearRevenue / 1e9).toFixed(2)}B`,
      impressions: combinedLinearImpressions,
      status: linearData.approvalRate > 70 && ddlData.avgMape < 5 ? 'On Track' : 'Attention',
      statusColor: linearData.approvalRate > 70 && ddlData.avgMape < 5 ? 'text-green-600' : 'text-yellow-600',
      change: '+3.2%',
      lastPublished: '4 hours ago',
      subtitle: 'Traditional + Advanced Targeting',
      canAccess: getPermission('linear').canView,
    },
    {
      name: 'Digital',
      path: '/digital',
      icon: Monitor,
      color: 'bg-purple-500',
      revenue: `$${(digitalRevenue / 1e6).toFixed(0)}M`,
      impressions: digitalData.totalViews,
      status: digitalData.fillRate > 80 ? 'On Track' : 'Attention',
      statusColor: digitalData.fillRate > 80 ? 'text-green-600' : 'text-yellow-600',
      change: '+8.2%',
      lastPublished: '2 hours ago',
      subtitle: 'Portfolio & allocation',
      canAccess: getPermission('digital').canView,
    },
    {
      name: 'Converged',
      path: '/converged',
      icon: Target,
      color: 'bg-green-500',
      revenue: `$${(totalRevenue / 1e9).toFixed(2)}B`,
      impressions: combinedLinearImpressions + digitalData.totalViews,
      status: 'On Track',
      statusColor: 'text-green-600',
      change: '+4.1%',
      lastPublished: '2 hours ago',
      subtitle: 'Cross-platform forecasting',
      canAccess: getPermission('linear').canView,
    },
  ];

  const riskOpportunities = [
    { type: 'risk', label: 'Sports schedule uncertainty', impact: '-$18M', probability: 'Medium' },
    { type: 'risk', label: 'Digital fill rate pressure', impact: '-$12M', probability: 'High' },
    { type: 'opportunity', label: 'Upfront pricing strength', impact: '+$25M', probability: 'High' },
    { type: 'opportunity', label: 'Streaming growth acceleration', impact: '+$15M', probability: 'Medium' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Executive Dashboard"
        subtitle={`Welcome back, ${currentUser.name}`}
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {/* Strategic KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {Object.entries(strategicMetrics).map(([key, metric]) => (
            <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {key === 'riskExposure' && '$'}
                    {metric.value}
                    {metric.unit}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    metric.trend === 'up'
                      ? key === 'riskExposure'
                        ? 'bg-green-100'
                        : 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  {metric.trend === 'up' ? (
                    key === 'riskExposure' ? (
                      <TrendingDown size={20} className="text-green-600" />
                    ) : (
                      <TrendingUp size={20} className="text-green-600" />
                    )
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {metric.change > 0 ? (
                  <ArrowUpRight size={14} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={14} className="text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </span>
                <span className="text-sm text-gray-400 ml-1">vs prior quarter</span>
              </div>
            </div>
          ))}
        </div>

        {/* Module Overview Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecasting Modules</h2>
          <div className="grid grid-cols-3 gap-4">
            {moduleStatus.map((module) => (
              <div
                key={module.name}
                className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${
                  !module.canAccess ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${module.color} text-white`}>
                    <module.icon size={20} />
                  </div>
                  <span className={`text-sm font-medium ${module.statusColor}`}>
                    {module.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                {module.subtitle && <p className="text-xs text-gray-500">{module.subtitle}</p>}
                <p className="text-2xl font-bold text-gray-900 mt-1">{module.revenue}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-green-600 font-medium">{module.change}</span>
                  <span className="text-xs text-gray-400">{module.lastPublished}</span>
                </div>
                {module.canAccess ? (
                  <Link
                    to={module.path}
                    className="mt-4 flex items-center justify-center gap-1 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-1 w-full py-2 bg-gray-50 rounded-lg text-sm text-gray-400">
                    No Access
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Risk & Opportunities */}
          <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risks & Opportunities</h2>
            <div className="space-y-3">
              {riskOpportunities.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.type === 'risk' ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'risk' ? (
                      <AlertTriangle size={18} className="text-red-500" />
                    ) : (
                      <CheckCircle size={18} className="text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">Probability: {item.probability}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      item.type === 'risk' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Snapshot</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-500" />
                  <span className="text-sm text-gray-600">Linear Impressions</span>
                </div>
                <span className="font-semibold">{(linearData.total / 1e6).toFixed(0)}M</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PieChart size={18} className="text-purple-500" />
                  <span className="text-sm text-gray-600">Digital Fill Rate</span>
                </div>
                <span className="font-semibold">{digitalData.fillRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-green-500" />
                  <span className="text-sm text-gray-600">Targeting Coverage</span>
                </div>
                <span className="font-semibold">{ddlData.targetCoverage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-500" />
                  <span className="text-sm text-gray-600">Avg CPM</span>
                </div>
                <span className="font-semibold">${avgCPM.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
