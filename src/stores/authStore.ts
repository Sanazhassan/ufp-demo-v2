import { create } from 'zustand';
import type { User, UserRole, Permission } from '../types/auth';
import { rolePermissions, demoUsers } from '../types/auth';

interface AuthState {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  getPermission: (module: string) => Permission;
  canAccess: (module: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: demoUsers[0], // Default to executive
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  switchRole: (role) => {
    const user = demoUsers.find((u) => u.role === role);
    if (user) {
      set({ currentUser: user });
    }
  },
  
  getPermission: (module) => {
    const { currentUser } = get();
    return rolePermissions[currentUser.role]?.[module] || {
      canView: false,
      canEdit: false,
      canApprove: false,
      canPublish: false,
    };
  },
  
  canAccess: (module) => {
    const permission = get().getPermission(module);
    return permission.canView;
  },
}));
