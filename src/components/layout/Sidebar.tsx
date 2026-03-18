import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Target,
  Monitor,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

const navItems = [
  { path: '/', icon: Home, label: 'Home', description: 'Executive dashboard', module: 'home' },
  { path: '/linear', icon: TrendingUp, label: 'Linear', description: 'Traditional Linear forecasts', module: 'linear' },
  { path: '/ddl', icon: Target, label: 'DDL', description: 'Advanced target forecasts', module: 'ddl' },
  { path: '/digital', icon: Monitor, label: 'Digital', description: 'Portfolio & allocation', module: 'digital' },
  { path: '/finance', icon: DollarSign, label: 'Finance APM', description: 'Scenario studio', module: 'finance' },
  { path: '/audit', icon: FileText, label: 'Audit Log', description: 'Publishing & history', module: 'audit' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { canAccess, getPermission } = useAuthStore();

  return (
    <aside
      className={clsx(
        'h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 sticky top-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-white">UFP</h1>
            <p className="text-xs text-gray-400">Unified Forecasting</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const hasAccess = canAccess(item.module);
          const permission = getPermission(item.module);
          
          if (!hasAccess) {
            return (
              <div
                key={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-600 cursor-not-allowed',
                  sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? `${item.label} (No Access)` : undefined}
              >
                <div className="relative flex-shrink-0">
                  <item.icon size={20} />
                  <Lock size={10} className="absolute -bottom-1 -right-1 text-gray-500" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-600 truncate">No access</div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.label}</span>
                    {permission.canEdit && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                        Edit
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{item.description}</div>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={clsx('p-4 border-t border-gray-700', sidebarCollapsed && 'hidden')}>
        <div className="text-xs text-gray-500">
          <div>Version 2.0.0</div>
          <div>Last sync: 5 min ago</div>
        </div>
      </div>
    </aside>
  );
}
