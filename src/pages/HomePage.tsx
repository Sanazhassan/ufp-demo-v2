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

export function HomePage() {
  const { currentUser, getPermission } = useAuthStore();

  // Strategic KPIs for executive view
  const strategicMetrics = {
    totalRevenue: { value: 2.27, unit: 'B', change: 3.2, label: 'Total Forecast Revenue', trend: 'up' },
    yoyGrowth: { value: 4.8, unit: '%', change: 1.2, label: 'YoY Growth', trend: 'up' },
    forecastAccuracy: { value: 96.2, unit: '%', change: 0.8, label: 'Forecast Accuracy', trend: 'up' },
    riskExposure: { value: 45, unit: 'M', change: -12, label: 'Risk Exposure', trend: 'down' },
  };

  const moduleStatus = [
    {
      name: 'Traditional Linear',
      path: '/linear',
      icon: TrendingUp,
      color: 'bg-blue-500',
      revenue: '$1.42B',
      status: 'On Track',
      statusColor: 'text-green-600',
      change: '+2.1%',
      lastPublished: '4 hours ago',
      canAccess: getPermission('linear').canView,
    },
    {
      name: 'Data-Driven Linear',
      path: '/ddl',
      icon: Target,
      color: 'bg-green-500',
      revenue: '$380M',
      status: 'On Track',
      statusColor: 'text-green-600',
      change: '+5.8%',
      lastPublished: '6 hours ago',
      canAccess: getPermission('ddl').canView,
    },
    {
      name: 'Digital',
      path: '/digital',
      icon: Monitor,
      color: 'bg-purple-500',
      revenue: '$425M',
      status: 'Attention',
      statusColor: 'text-yellow-600',
      change: '+8.2%',
      lastPublished: '2 hours ago',
      canAccess: getPermission('digital').canView,
    },
    {
      name: 'Finance APM',
      path: '/finance',
      icon: DollarSign,
      color: 'bg-emerald-500',
      revenue: '$2.27B',
      status: 'Pending',
      statusColor: 'text-blue-600',
      change: '+3.2%',
      lastPublished: 'In Progress',
      canAccess: getPermission('finance').canView,
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
          <div className="grid grid-cols-4 gap-4">
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
                <span className="font-semibold">485M</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PieChart size={18} className="text-purple-500" />
                  <span className="text-sm text-gray-600">Digital Fill Rate</span>
                </div>
                <span className="font-semibold">87.3%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-green-500" />
                  <span className="text-sm text-gray-600">DDL Coverage</span>
                </div>
                <span className="font-semibold">92.1%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-500" />
                  <span className="text-sm text-gray-600">Avg CPM</span>
                </div>
                <span className="font-semibold">$34.28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
