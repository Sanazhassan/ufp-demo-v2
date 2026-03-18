import { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  User,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Header } from '../components/layout';
import { DataTable, Badge, StatusBadge, Tabs, TabList, TabTrigger, TabContent } from '../components/ui';
import { generateAuditLog, generateForecastRuns } from '../data/mockData';
import type { AuditLogEntry } from '../types';

export function AuditPage() {
  const auditLog = useMemo(() => generateAuditLog(), []);
  const forecastRuns = useMemo(() => generateForecastRuns(), []);
  
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const filteredLog = useMemo(() => {
    return auditLog.filter((entry) => {
      if (moduleFilter !== 'all' && entry.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      return true;
    });
  }, [auditLog, moduleFilter, actionFilter]);

  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm">
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs">
            {(value as string).charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (value: unknown) => {
        const actionColors: Record<string, string> = {
          create: 'bg-blue-100 text-blue-800',
          update: 'bg-yellow-100 text-yellow-800',
          approve: 'bg-green-100 text-green-800',
          publish: 'bg-purple-100 text-purple-800',
          override: 'bg-orange-100 text-orange-800',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              actionColors[value as string] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
          </span>
        );
      },
    },
    {
      key: 'module',
      header: 'Module',
      render: (value: unknown) => (
        <Badge variant="outline">{(value as string).toUpperCase()}</Badge>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (value: unknown, row: AuditLogEntry) => (
        <div>
          <div className="font-medium text-sm">{value as string}</div>
          <div className="text-xs text-gray-500">{row.entityId}</div>
        </div>
      ),
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (value: unknown) => {
        const changes = value as AuditLogEntry['changes'];
        if (!changes || changes.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="text-xs">
            {changes.map((c, i) => (
              <div key={i}>
                <span className="text-gray-500">{c.field}:</span>{' '}
                <span className="text-red-500 line-through">{String(c.oldValue)}</span>{' '}
                <span className="text-green-600">{String(c.newValue)}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value: unknown) =>
        value ? (
          <span className="text-sm text-gray-600">{value as string}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  const overrideLog = auditLog.filter((e) => e.action === 'override');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Publishing & Audit Log"
        subtitle="Track all forecast changes, approvals, and publications"
        actions={
          <button className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export Log
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="runs">
          <TabList className="mb-6">
            <TabTrigger value="runs" icon={<Clock size={16} />}>
              Forecast Runs
            </TabTrigger>
            <TabTrigger
              value="audit"
              icon={<FileText size={16} />}
              badge={filteredLog.length}
            >
              Audit Log
            </TabTrigger>
            <TabTrigger
              value="overrides"
              icon={<User size={16} />}
              badge={overrideLog.length}
            >
              Override History
            </TabTrigger>
          </TabList>

          {/* Forecast Runs */}
          <TabContent value="runs">
            <div className="space-y-4">
              {forecastRuns.map((run) => (
                <div key={run.id} className="card">
                  <div
                    className="card-header flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedRun(expandedRun === run.id ? null : run.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      {expandedRun === run.id ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <div>
                        <span className="font-medium capitalize">{run.module}</span>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-sm text-gray-500">{run.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {new Date(run.startedAt).toLocaleString()}
                      </div>
                      <StatusBadge status={run.status} />
                    </div>
                  </div>
                  
                  {expandedRun === run.id && (
                    <div className="card-body border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm text-gray-500">Input Snapshot</div>
                          <div className="font-medium">{run.inputSnapshotId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Started At</div>
                          <div className="font-medium">
                            {new Date(run.startedAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Completed At</div>
                          <div className="font-medium">
                            {run.completedAt
                              ? new Date(run.completedAt).toLocaleString()
                              : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Published At</div>
                          <div className="font-medium">
                            {run.publishedAt
                              ? new Date(run.publishedAt).toLocaleString()
                              : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2">Model Versions</div>
                        <div className="flex gap-2">
                          {Object.entries(run.modelVersions).map(([name, version]) => (
                            <Badge key={name} variant="outline">
                              {name}: {version}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="btn-secondary text-sm">View Details</button>
                        <button className="btn-secondary text-sm">Download Artifacts</button>
                        {run.status === 'completed' && !run.publishedAt && (
                          <button className="btn-primary text-sm">Publish</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabContent>

          {/* Full Audit Log */}
          <TabContent value="audit">
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <span>Activity Log</span>
                <div className="flex items-center gap-4">
                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="all">All Modules</option>
                    <option value="linear">Linear</option>
                    <option value="ddl">Advanced Targeting</option>
                    <option value="digital">Digital</option>
                    <option value="finance">Finance</option>
                  </select>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="all">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="approve">Approve</option>
                    <option value="publish">Publish</option>
                    <option value="override">Override</option>
                  </select>
                </div>
              </div>
              <DataTable
                data={filteredLog}
                columns={auditColumns}
                pageSize={15}
                stickyHeader
              />
            </div>
          </TabContent>

          {/* Override History */}
          <TabContent value="overrides">
            <div className="card">
              <div className="card-header">Override History</div>
              <DataTable
                data={overrideLog}
                columns={auditColumns}
                pageSize={15}
                stickyHeader
              />
            </div>

            {/* Override Summary */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="card p-4">
                <div className="text-sm text-gray-500">Total Overrides</div>
                <div className="text-2xl font-bold text-gray-900">{overrideLog.length}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-gray-500">By Linear</div>
                <div className="text-2xl font-bold text-blue-600">
                  {overrideLog.filter((e) => e.module === 'linear').length}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-gray-500">By Finance</div>
                <div className="text-2xl font-bold text-green-600">
                  {overrideLog.filter((e) => e.module === 'finance').length}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-gray-500">Pending Approval</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.floor(overrideLog.length * 0.3)}
                </div>
              </div>
            </div>
          </TabContent>
        </Tabs>
      </div>
    </div>
  );
}
