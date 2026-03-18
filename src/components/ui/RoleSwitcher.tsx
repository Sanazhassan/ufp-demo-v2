import { useState } from 'react';
import { User, ChevronDown, Shield, TrendingUp, Target, Monitor, DollarSign, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { roleLabels, roleDescriptions, demoUsers } from '../../types/auth';
import type { UserRole } from '../../types/auth';
import { clsx } from 'clsx';

const roleIcons: Record<UserRole, React.ReactNode> = {
  executive: <Shield size={16} />,
  research: <TrendingUp size={16} />,
  advanced_ads: <Target size={16} />,
  yield: <Monitor size={16} />,
  finance: <DollarSign size={16} />,
  admin: <Settings size={16} />,
};

const roleColors: Record<UserRole, string> = {
  executive: 'bg-purple-100 text-purple-700',
  research: 'bg-blue-100 text-blue-700',
  advanced_ads: 'bg-green-100 text-green-700',
  yield: 'bg-orange-100 text-orange-700',
  finance: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-red-100 text-red-700',
};

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className={clsx('p-1.5 rounded-full', roleColors[currentUser.role])}>
          <User size={16} />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
          <div className="text-xs text-gray-500">{roleLabels[currentUser.role]}</div>
        </div>
        <ChevronDown size={16} className={clsx('text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase">Switch Role (Demo)</div>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchRole(user.role);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors',
                    currentUser.id === user.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className={clsx('p-2 rounded-lg mt-0.5', roleColors[user.role])}>
                    {roleIcons[user.role]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-600">{roleLabels[user.role]}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{roleDescriptions[user.role]}</div>
                  </div>
                  {currentUser.id === user.id && (
                    <div className="text-primary-600 text-xs font-medium">Active</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
