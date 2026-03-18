import type { ValidationResult } from '../types';

// Linear-specific validations
export const linearValidations: ValidationResult[] = [
  { id: 'lin_v1', category: 'audience', status: 'pass', checkName: 'NRLD Data Completeness', message: 'All networks and demos present for Q2 2026', affectedRecords: 0 },
  { id: 'lin_v2', category: 'audience', status: 'pass', checkName: 'UE Version Alignment', message: 'Using March 2026 Universe Estimates', affectedRecords: 0 },
  { id: 'lin_v3', category: 'schedule', status: 'warning', checkName: 'Schedule Reschedules', message: '3 programs have pending reschedule confirmations', affectedRecords: 3 },
  { id: 'lin_v4', category: 'schedule', status: 'pass', checkName: 'PSP Feed Freshness', message: 'Feed updated within last 24 hours', affectedRecords: 0 },
  { id: 'lin_v5', category: 'ue', status: 'pass', checkName: 'UE Variant Coverage', message: 'All required UE variants available', affectedRecords: 0 },
  { id: 'lin_v6', category: 'ue', status: 'pass', checkName: 'Methodology Factors', message: 'ACM/C3/C7 conversion factors current', affectedRecords: 0 },
];

// DDL-specific validations
export const ddlValidations: ValidationResult[] = [
  { id: 'ddl_v1', category: 'audience', status: 'pass', checkName: 'VideoAmp Coverage', message: 'All 19 networks with complete data', affectedRecords: 0 },
  { id: 'ddl_v2', category: 'audience', status: 'warning', checkName: 'Comscore Data Freshness', message: 'Comscore data is 48 hours behind', affectedRecords: 850 },
  { id: 'ddl_v3', category: 'audience', status: 'pass', checkName: 'Nielsen Advanced Targets', message: '60+ targets validated', affectedRecords: 0 },
  { id: 'ddl_v4', category: 'audience', status: 'pass', checkName: 'Lake5 Segment Sync', message: 'All segments synchronized', affectedRecords: 0 },
  { id: 'ddl_v5', category: 'audience', status: 'pass', checkName: 'Multi-Currency Alignment', message: 'Nielsen/VideoAmp/Comscore mapped correctly', affectedRecords: 0 },
];

// Digital-specific validations
export const digitalValidations: ValidationResult[] = [
  { id: 'dig_v1', category: 'digital', status: 'pass', checkName: 'Ad Views Data Quality', message: '2 years of historical data validated', affectedRecords: 0 },
  { id: 'dig_v2', category: 'digital', status: 'pass', checkName: 'OP1 Order Sync', message: 'All active orders synchronized', affectedRecords: 0 },
  { id: 'dig_v3', category: 'digital', status: 'warning', checkName: 'Pressure Inventory Load', message: 'Hulu pressure inventory partially loaded', affectedRecords: 120 },
  { id: 'dig_v4', category: 'digital', status: 'pass', checkName: 'FreeWheel API Connection', message: 'Dummy placements retrieved successfully', affectedRecords: 0 },
  { id: 'dig_v5', category: 'digital', status: 'pass', checkName: 'Capacity Constraints', message: 'All placement constraints defined', affectedRecords: 0 },
];

// Finance-specific validations
export const financeValidations: ValidationResult[] = [
  { id: 'fin_v1', category: 'finance', status: 'pass', checkName: 'Rate Card Currency', message: 'All rate cards using current pricing', affectedRecords: 0 },
  { id: 'fin_v2', category: 'finance', status: 'fail', checkName: 'Stewardship Liability Sync', message: 'Q2 liability data missing for 3 networks', affectedRecords: 45 },
  { id: 'fin_v3', category: 'finance', status: 'warning', checkName: 'SAP Actuals Freshness', message: 'SAP data is 3 days behind', affectedRecords: 1200 },
  { id: 'fin_v4', category: 'finance', status: 'pass', checkName: 'Linear Forecast Input', message: 'Latest Linear forecast loaded', affectedRecords: 0 },
  { id: 'fin_v5', category: 'finance', status: 'pass', checkName: 'DDL Forecast Input', message: 'Latest DDL forecast loaded', affectedRecords: 0 },
  { id: 'fin_v6', category: 'finance', status: 'pass', checkName: 'Digital Forecast Input', message: 'Latest Digital forecast loaded', affectedRecords: 0 },
  { id: 'fin_v7', category: 'finance', status: 'pass', checkName: 'Pricing Guidance', message: 'Current quarter guidance applied', affectedRecords: 0 },
];
