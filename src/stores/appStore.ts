import { create } from 'zustand';
import type { FilterState, ScenarioLever, AlertItem } from '../types';
import { defaultScenarioLevers, generateAlerts } from '../data/mockData';

interface AppState {
  // Global filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Scenario state
  scenarioLevers: ScenarioLever[];
  setScenarioLever: (id: string, value: number) => void;
  resetScenarioLevers: () => void;
  
  // Alerts
  alerts: AlertItem[];
  dismissAlert: (id: string) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Selected items
  selectedNetwork: string | null;
  setSelectedNetwork: (id: string | null) => void;
  selectedQuarter: string;
  setSelectedQuarter: (id: string) => void;
  
  // Compare mode
  compareMode: boolean;
  setCompareMode: (enabled: boolean) => void;
  comparedScenarioId: string | null;
  setComparedScenarioId: (id: string | null) => void;
}

const defaultFilters: FilterState = {
  networks: [],
  demos: [],
  quarters: ['2026Q2'],
};

export const useAppStore = create<AppState>((set) => ({
  // Filters
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  
  // Scenario levers
  scenarioLevers: defaultScenarioLevers.map(l => ({ ...l })),
  setScenarioLever: (id, value) =>
    set((state) => ({
      scenarioLevers: state.scenarioLevers.map((lever) =>
        lever.id === id ? { ...lever, value } : lever
      ),
    })),
  resetScenarioLevers: () =>
    set({ scenarioLevers: defaultScenarioLevers.map(l => ({ ...l })) }),
  
  // Alerts
  alerts: generateAlerts(),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, dismissed: true } : alert
      ),
    })),
  
  // UI state
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // Selected items
  selectedNetwork: null,
  setSelectedNetwork: (id) => set({ selectedNetwork: id }),
  selectedQuarter: '2026Q2',
  setSelectedQuarter: (id) => set({ selectedQuarter: id }),
  
  // Compare mode
  compareMode: false,
  setCompareMode: (enabled) => set({ compareMode: enabled }),
  comparedScenarioId: null,
  setComparedScenarioId: (id) => set({ comparedScenarioId: id }),
}));
