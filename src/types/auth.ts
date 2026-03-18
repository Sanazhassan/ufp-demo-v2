export type UserRole = 
  | 'executive'      // Leadership - strategic view only
  | 'research'       // Linear module owner
  | 'advanced_ads'   // DDL module owner
  | 'yield'          // Digital module owner
  | 'finance'        // Finance APM owner
  | 'admin';         // Full access

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canPublish: boolean;
}

export const rolePermissions: Record<UserRole, Record<string, Permission>> = {
  executive: {
    home: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    linear: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    ddl: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    digital: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    finance: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    audit: { canView: true, canEdit: false, canApprove: false, canPublish: false },
  },
  research: {
    home: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    linear: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    ddl: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    digital: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    finance: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    audit: { canView: true, canEdit: false, canApprove: false, canPublish: false },
  },
  advanced_ads: {
    home: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    linear: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    ddl: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    digital: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    finance: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    audit: { canView: true, canEdit: false, canApprove: false, canPublish: false },
  },
  yield: {
    home: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    linear: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    ddl: { canView: false, canEdit: false, canApprove: false, canPublish: false },
    digital: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    finance: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    audit: { canView: true, canEdit: false, canApprove: false, canPublish: false },
  },
  finance: {
    home: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    linear: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    ddl: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    digital: { canView: true, canEdit: false, canApprove: false, canPublish: false },
    finance: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    audit: { canView: true, canEdit: false, canApprove: false, canPublish: false },
  },
  admin: {
    home: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    linear: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    ddl: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    digital: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    finance: { canView: true, canEdit: true, canApprove: true, canPublish: true },
    audit: { canView: true, canEdit: true, canApprove: true, canPublish: true },
  },
};

export const roleLabels: Record<UserRole, string> = {
  executive: 'Executive Leadership',
  research: 'Research Analyst',
  advanced_ads: 'Advanced Ads Analyst',
  yield: 'Yield & Pricing',
  finance: 'Finance Analyst',
  admin: 'Administrator',
};

export const roleDescriptions: Record<UserRole, string> = {
  executive: 'Strategic view of forecasting metrics',
  research: 'Traditional Linear forecasting and overrides',
  advanced_ads: 'Advanced Targeting audience forecasting',
  yield: 'Digital portfolio and allocation management',
  finance: 'Revenue projections and scenario modeling',
  admin: 'Full system access and configuration',
};

// Demo users for role switching
export const demoUsers: User[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'executive' },
  { id: '2', name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'research' },
  { id: '3', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'advanced_ads' },
  { id: '4', name: 'James Wilson', email: 'james.wilson@company.com', role: 'yield' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', role: 'finance' },
  { id: '6', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
];
