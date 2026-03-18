import { Bell, Settings, Search } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import { clsx } from 'clsx';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { alerts } = useAppStore();
  const activeAlerts = alerts.filter((a) => !a.dismissed && a.severity !== 'info');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {actions}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            {activeAlerts.length > 0 && (
              <span className={clsx(
                'absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center',
                activeAlerts.some(a => a.severity === 'critical') ? 'bg-red-500' : 'bg-yellow-500'
              )}>
                {activeAlerts.length}
              </span>
            )}
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          <div className="pl-4 border-l border-gray-200">
            <RoleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
