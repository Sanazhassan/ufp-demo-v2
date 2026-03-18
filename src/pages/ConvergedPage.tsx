import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Save, GitCompare, Download, Plus, RefreshCw, ChevronDown, ChevronRight, AlertTriangle, History, Edit3, X, Check, Lock, TrendingUp, TrendingDown, Calendar, Layers, BarChart3, Info } from 'lucide-react';
import * as d3 from 'd3';
import { Header } from '../components/layout';
import { Badge, StatCard } from '../components/ui';
import { useAuthStore } from '../stores/authStore';

interface ForecastRow {
  id: string;
  network: string;
  product: string;
  channel: 'Linear' | 'Digital';
  systemForecast: number;
  p10: number;
  p90: number;
  override?: number;
  overrideType?: 'absolute' | 'uplift' | 'cap' | 'floor';
  overrideReason?: string;
  confidence: 'high' | 'medium' | 'low';
  risk: 'none' | 'warning' | 'high';
  monthlyTrend: number[];
}

const generateMonthlyTrend = (base: number): number[] => {
  const months: number[] = [];
  let current = base * 0.85;
  for (let i = 0; i < 6; i++) {
    current = current * (0.95 + Math.random() * 0.15);
    months.push(Math.floor(current));
  }
  return months;
};

const generateForecastRows = (): ForecastRow[] => {
  const networks = ['ABC', 'NBC', 'CBS', 'FOX', 'ESPN'];
  const linearProducts = ['Prime', 'Late Night', 'Daytime', 'Sports'];
  const digitalProducts = ['CTV Premium', 'CTV Standard', 'Mobile Video', 'Desktop'];
  const rows: ForecastRow[] = [];
  networks.forEach((network) => {
    linearProducts.forEach((product) => {
      const base = Math.floor(Math.random() * 5000000) + 1000000;
      rows.push({ id: `${network}-linear-${product}`, network, product, channel: 'Linear', systemForecast: base, p10: Math.floor(base * 0.85), p90: Math.floor(base * 1.15), confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low', risk: Math.random() > 0.8 ? 'warning' : 'none', monthlyTrend: generateMonthlyTrend(base / 6) });
    });
    digitalProducts.forEach((product) => {
      const base = Math.floor(Math.random() * 3000000) + 500000;
      rows.push({ id: `${network}-digital-${product}`, network, product, channel: 'Digital', systemForecast: base, p10: Math.floor(base * 0.8), p90: Math.floor(base * 1.2), confidence: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low', risk: Math.random() > 0.85 ? 'warning' : 'none', monthlyTrend: generateMonthlyTrend(base / 6) });
    });
  });
  return rows;
};

const overrideReasons = ['Tentpole event / programming change', 'Inventory conversation / supply intel', 'Historical performance adjustment', 'Client targeting constraints', 'Other'];
const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

function StackedAreaChart({ data, height = 200 }: { data: { month: string; linear: number; digital: number }[]; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const x = d3.scalePoint().domain(data.map(d => d.month)).range([0, width]).padding(0.5);
    const maxVal = d3.max(data, d => d.linear + d.digital) || 0;
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([chartHeight, 0]);
    g.append('g').attr('class', 'grid').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => '')).selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '2,2');
    g.select('.grid .domain').remove();
    const areaLinear = d3.area<typeof data[0]>().x(d => x(d.month) || 0).y0(chartHeight).y1(d => y(d.linear)).curve(d3.curveMonotoneX);
    const areaDigital = d3.area<typeof data[0]>().x(d => x(d.month) || 0).y0(d => y(d.linear)).y1(d => y(d.linear + d.digital)).curve(d3.curveMonotoneX);
    g.append('path').datum(data).attr('fill', '#3b82f6').attr('fill-opacity', 0.8).attr('d', areaLinear);
    g.append('path').datum(data).attr('fill', '#8b5cf6').attr('fill-opacity', 0.8).attr('d', areaDigital);
    g.append('g').attr('transform', `translate(0,${chartHeight})`).call(d3.axisBottom(x)).selectAll('text').attr('font-size', '11px');
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${((d as number) / 1e6).toFixed(0)}M`)).selectAll('text').attr('font-size', '11px');
    data.forEach(d => { g.append('circle').attr('cx', x(d.month) || 0).attr('cy', y(d.linear + d.digital)).attr('r', 4).attr('fill', '#7c3aed'); });
  }, [data, height]);
  return <svg ref={svgRef} width="100%" height={height} />;
}

function HorizontalBarChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const margin = { top: 10, right: 60, bottom: 10, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const y = d3.scaleBand().domain(data.map(d => d.label)).range([0, chartHeight]).padding(0.3);
    const maxVal = d3.max(data, d => d.value) || 0;
    const x = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, width]);
    g.selectAll('rect').data(data).enter().append('rect').attr('y', d => y(d.label) || 0).attr('x', 0).attr('height', y.bandwidth()).attr('width', d => x(d.value)).attr('fill', '#3b82f6').attr('rx', 4);
    g.selectAll('.label').data(data).enter().append('text').attr('x', -5).attr('y', d => (y(d.label) || 0) + y.bandwidth() / 2).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('font-size', '11px').attr('fill', '#374151').text(d => d.label);
    g.selectAll('.value').data(data).enter().append('text').attr('x', d => x(d.value) + 5).attr('y', d => (y(d.label) || 0) + y.bandwidth() / 2).attr('dominant-baseline', 'middle').attr('font-size', '11px').attr('fill', '#6b7280').text(d => `${(d.value / 1e6).toFixed(1)}M`);
  }, [data, height]);
  return <svg ref={svgRef} width="100%" height={height} />;
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full rounded-t" style={{ height: `${(value / max) * 100}%`, backgroundColor: color, minHeight: '4px' }} />
          <span className="text-xs text-gray-500 mt-1">{monthLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function ConvergedPage() {
  const { getPermission } = useAuthStore();
  const permission = getPermission('linear');
  const [planName, setPlanName] = useState('Q2 2026 Upfront Plan');
  const [forecastType, setForecastType] = useState<'Linear' | 'Digital' | 'Converged'>('Converged');
  const [convergedMethod, setConvergedMethod] = useState<'additive' | 'deduped'>('deduped');
  const [rows, setRows] = useState<ForecastRow[]>(() => generateForecastRows());
  const [expandedNetworks, setExpandedNetworks] = useState<Set<string>>(new Set(['ABC', 'NBC']));
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTargetRow, setOverrideTargetRow] = useState<ForecastRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState<ForecastRow | null>(null);
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideType, setOverrideType] = useState<'absolute' | 'uplift' | 'cap' | 'floor'>('absolute');
  const [selectedReason, setSelectedReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(['ABC', 'NBC', 'CBS', 'FOX', 'ESPN']);
  const [includeLinear, setIncludeLinear] = useState(true);
  const [includeDigital, setIncludeDigital] = useState(true);
  const [overlapIntensity, setOverlapIntensity] = useState('medium');
  const [activeScenario, setActiveScenario] = useState('2');
  const [seasonalIndex, setSeasonalIndex] = useState('auto');
  const [preemptionRisk, setPreemptionRisk] = useState('medium');
  const [viewabilityTarget, setViewabilityTarget] = useState(83);
  const [overlapModel, setOverlapModel] = useState('identity');

  const totals = useMemo(() => {
    const linearRows = rows.filter((r) => r.channel === 'Linear' && selectedNetworks.includes(r.network));
    const digitalRows = rows.filter((r) => r.channel === 'Digital' && selectedNetworks.includes(r.network));
    const linearTotal = linearRows.reduce((sum, r) => sum + (r.override ?? r.systemForecast), 0);
    const digitalTotal = digitalRows.reduce((sum, r) => sum + (r.override ?? r.systemForecast), 0);
    const overlapRate = overlapIntensity === 'low' ? 0.08 : overlapIntensity === 'medium' ? 0.15 : 0.22;
    const overlap = convergedMethod === 'deduped' ? Math.floor((linearTotal + digitalTotal) * overlapRate) : 0;
    const convergedTotal = linearTotal + digitalTotal - overlap;
    const overrideCount = rows.filter((r) => r.override !== undefined).length;
    const monthlyLinear = [0, 0, 0, 0, 0, 0];
    const monthlyDigital = [0, 0, 0, 0, 0, 0];
    linearRows.forEach((r) => r.monthlyTrend.forEach((v, i) => (monthlyLinear[i] += v)));
    digitalRows.forEach((r) => r.monthlyTrend.forEach((v, i) => (monthlyDigital[i] += v)));
    return { linearTotal, digitalTotal, overlap, convergedTotal, overrideCount, monthlyLinear, monthlyDigital };
  }, [rows, convergedMethod, overlapIntensity, selectedNetworks]);

  const baselineTotals = useMemo(() => {
    const linearRows = rows.filter((r) => r.channel === 'Linear' && selectedNetworks.includes(r.network));
    const digitalRows = rows.filter((r) => r.channel === 'Digital' && selectedNetworks.includes(r.network));
    const linearTotal = linearRows.reduce((sum, r) => sum + r.systemForecast, 0);
    const digitalTotal = digitalRows.reduce((sum, r) => sum + r.systemForecast, 0);
    const overlapRate = overlapIntensity === 'low' ? 0.08 : overlapIntensity === 'medium' ? 0.15 : 0.22;
    const overlap = convergedMethod === 'deduped' ? Math.floor((linearTotal + digitalTotal) * overlapRate) : 0;
    const convergedTotal = linearTotal + digitalTotal - overlap;
    return { linearTotal, digitalTotal, convergedTotal };
  }, [rows, convergedMethod, overlapIntensity, selectedNetworks]);

  const chartData = useMemo(() => monthLabels.map((month, i) => ({ month, linear: totals.monthlyLinear[i], digital: totals.monthlyDigital[i] })), [totals]);
  const networks = [...new Set(rows.map((r) => r.network))];
  const filteredRows = rows.filter((r) => {
    if (!selectedNetworks.includes(r.network)) return false;
    if (r.channel === 'Linear' && !includeLinear) return false;
    if (r.channel === 'Digital' && !includeDigital) return false;
    if (forecastType === 'Linear' && r.channel !== 'Linear') return false;
    if (forecastType === 'Digital' && r.channel !== 'Digital') return false;
    return true;
  });
  const networkSummary = useMemo(() => networks.map((network) => ({ label: network, value: filteredRows.filter((r) => r.network === network).reduce((sum, r) => sum + (r.override ?? r.systemForecast), 0) })).sort((a, b) => b.value - a.value), [filteredRows, networks]);

  const toggleNetwork = (network: string) => { setExpandedNetworks((prev) => { const next = new Set(prev); if (next.has(network)) next.delete(network); else next.add(network); return next; }); };
  const openOverrideModal = (row: ForecastRow) => { setOverrideTargetRow(row); setOverrideValue(row.override?.toString() || ''); setOverrideType('absolute'); setSelectedReason(row.overrideReason || ''); setShowOverrideModal(true); };
  const handleOverrideSave = () => {
    if (!overrideTargetRow || !overrideValue || !selectedReason) return;
    setRows((prev) => prev.map((r) => r.id === overrideTargetRow.id ? { ...r, override: overrideType === 'absolute' ? parseInt(overrideValue) : overrideType === 'uplift' ? Math.floor(r.systemForecast * (1 + parseInt(overrideValue) / 100)) : overrideType === 'cap' ? Math.min(r.systemForecast, parseInt(overrideValue)) : Math.max(r.systemForecast, parseInt(overrideValue)), overrideType, overrideReason: selectedReason } : r));
    setShowOverrideModal(false); setOverrideTargetRow(null); setOverrideValue(''); setSelectedReason('');
  };
  const handleResetOverride = (rowId: string) => { setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, override: undefined, overrideType: undefined, overrideReason: undefined } : r)); };
  const openDetailModal = (row: ForecastRow) => { setDetailRow(row); setShowDetailModal(true); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Converged Forecast Studio" subtitle="Planning > Forecasting"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2" onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1500); }}><RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> Refresh</button>
            <button className="btn-secondary flex items-center gap-2"><Plus size={16} /> Create Scenario</button>
            <button className="btn-secondary flex items-center gap-2"><GitCompare size={16} /> Compare</button>
            <button className="btn-secondary flex items-center gap-2" disabled={!permission.canEdit}>{!permission.canEdit && <Lock size={14} />}<Save size={16} /> Save</button>
            <button className="btn-primary flex items-center gap-2"><Download size={16} /> Export</button>
          </div>
        }
      />

      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div><label className="text-xs text-gray-500 block mb-1">Plan Name</label><input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="input text-sm font-medium w-44" /></div>
          <div><label className="text-xs text-gray-500 block mb-1">Audience</label><select className="input text-sm w-24"><option>A25-54</option><option>A18-49</option></select></div>
          <div><label className="text-xs text-gray-500 block mb-1">Market</label><select className="input text-sm w-28"><option>US National</option></select></div>
          <div><label className="text-xs text-gray-500 block mb-1">Flight</label><div className="flex items-center gap-1 text-sm bg-gray-50 px-3 py-1.5 rounded border border-gray-200"><Calendar size={14} className="text-gray-400" /> Apr 1 - Sep 30, 2026</div></div>
          <div><label className="text-xs text-gray-500 block mb-1">Forecast Type</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['Linear', 'Digital', 'Converged'] as const).map((type) => (<button key={type} onClick={() => setForecastType(type)} className={`px-3 py-1.5 text-sm font-medium ${forecastType === type ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{type}</button>))}
            </div>
          </div>
          {forecastType === 'Converged' && <div><label className="text-xs text-gray-500 block mb-1">Method</label><button onClick={() => setConvergedMethod(convergedMethod === 'additive' ? 'deduped' : 'additive')} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${convergedMethod === 'deduped' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>{convergedMethod === 'deduped' ? 'Deduped' : 'Additive'}</button></div>}
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Scenarios:</span>
          <button onClick={() => setActiveScenario('1')} className={`px-4 py-2 rounded-lg border text-sm ${activeScenario === '1' ? 'bg-white border-primary-300 shadow-sm font-medium' : 'bg-white border-gray-200'}`}>
            <div className="font-medium">Baseline</div>
            <div className="text-xs text-gray-500">L: {(baselineTotals.linearTotal / 1e6).toFixed(1)}M | D: {(baselineTotals.digitalTotal / 1e6).toFixed(1)}M | Conv: {(baselineTotals.convergedTotal / 1e6).toFixed(1)}M</div>
          </button>
          <button onClick={() => setActiveScenario('2')} className={`px-4 py-2 rounded-lg border text-sm ${activeScenario === '2' ? 'bg-white border-primary-300 shadow-sm font-medium' : 'bg-white border-gray-200'}`}>
            <div className="font-medium flex items-center gap-2">Planner Adjusted {totals.overrideCount > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">{totals.overrideCount} changes</span>}</div>
            <div className="text-xs text-gray-500">L: {(totals.linearTotal / 1e6).toFixed(1)}M | D: {(totals.digitalTotal / 1e6).toFixed(1)}M | Conv: {(totals.convergedTotal / 1e6).toFixed(1)}M</div>
          </button>
          <button className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm"><Plus size={14} className="inline" /> Add</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto overflow-x-visible p-4" style={{overflow: 'visible'}}>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Layers size={16} /> Inputs</h3>
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">Networks</div>
            {networks.map((n) => (<label key={n} className="flex items-center gap-2 text-sm py-0.5"><input type="checkbox" checked={selectedNetworks.includes(n)} onChange={(e) => e.target.checked ? setSelectedNetworks([...selectedNetworks, n]) : setSelectedNetworks(selectedNetworks.filter((x) => x !== n))} className="rounded border-gray-300 text-primary-600 w-3.5 h-3.5" />{n}</label>))}
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">Channels</div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeLinear} onChange={(e) => setIncludeLinear(e.target.checked)} className="rounded border-gray-300 text-primary-600 w-3.5 h-3.5" /> Linear</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeDigital} onChange={(e) => setIncludeDigital(e.target.checked)} className="rounded border-gray-300 text-primary-600 w-3.5 h-3.5" /> Digital</label>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Forecast Drivers</h4>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Seasonal Index</span>
                  <div className="relative group">
                    <Info size={12} className="text-gray-400 cursor-help" />
                    <div className="absolute left-5 top-0 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                      Adjusts forecast based on historical seasonal patterns (holidays, sports events, viewing trends).
                    </div>
                  </div>
                </div>
                <span className="text-xs text-yellow-600 font-medium">~+2-4% imps</span>
              </div>
              <select value={seasonalIndex} onChange={(e) => setSeasonalIndex(e.target.value)} className="input text-sm w-full">
                <option value="auto">Auto (Recommended)</option>
                <option value="manual">Manual</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Preemption Risk</span>
                  <div className="relative group">
                    <Info size={12} className="text-gray-400 cursor-help" />
                    <div className="absolute left-5 top-0 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                      Risk of scheduled ads being bumped by higher-priority buys or breaking news. Higher risk = lower delivered impressions.
                    </div>
                  </div>
                </div>
                <span className="text-xs text-red-500 font-medium">~-1-3% imps</span>
              </div>
              <select value={preemptionRisk} onChange={(e) => setPreemptionRisk(e.target.value)} className="input text-sm w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Viewability Target</span>
                  <div className="relative group">
                    <Info size={12} className="text-gray-400 cursor-help" />
                    <div className="absolute left-5 top-0 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                      Percentage of impressions that meet viewability standards (50% of pixels visible for 1+ second). Higher targets may reduce available inventory.
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-700 font-medium">{viewabilityTarget}%</span>
              </div>
              <input type="range" min="50" max="100" value={viewabilityTarget} onChange={(e) => setViewabilityTarget(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Convergence</h4>
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">Overlap Model</span>
                <div className="relative group">
                  <Info size={12} className="text-gray-400 cursor-help" />
                  <div className="absolute left-5 top-0 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                    <div className="font-semibold mb-2">Overlap Model Types:</div>
                    <div className="mb-2"><span className="font-medium text-blue-300">Identity-modeled:</span> Probabilistic identity graphs matching users across channels (~70-85% confidence).</div>
                    <div className="mb-2"><span className="font-medium text-green-300">Panel-based:</span> Representative sample panels tracked across channels. Higher accuracy, limited scale.</div>
                    <div><span className="font-medium text-purple-300">Deterministic:</span> Exact verified matches from first-party data. Highest accuracy, lowest scale.</div>
                  </div>
                </div>
              </div>
              <select value={overlapModel} onChange={(e) => setOverlapModel(e.target.value)} className="input text-sm w-full">
                <option value="identity">Identity-modeled</option>
                <option value="panel">Panel-based</option>
                <option value="deterministic">Deterministic</option>
              </select>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Overlap Intensity</span>
                  <div className="relative group">
                    <Info size={12} className="text-gray-400 cursor-help" />
                    <div className="absolute left-5 top-0 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                      Estimated % of audience reached by both linear and digital. Higher overlap = more deduplication applied to converged totals.
                    </div>
                  </div>
                </div>
                <span className="text-xs text-purple-600 font-medium">~{overlapIntensity === 'low' ? '8' : overlapIntensity === 'medium' ? '15' : '22'}%</span>
              </div>
              <select value={overlapIntensity} onChange={(e) => setOverlapIntensity(e.target.value)} className="input text-sm w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 italic mt-2">Overlap affects incremental impressions and deduped totals.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-5 gap-4 mb-6">
            <StatCard title="Linear" value={`${(totals.linearTotal / 1e6).toFixed(1)}M`} trend="up" change={3.2} />
            <StatCard title="Digital" value={`${(totals.digitalTotal / 1e6).toFixed(1)}M`} trend="up" change={5.8} />
            {forecastType === 'Converged' && convergedMethod === 'deduped' && <StatCard title="Overlap" value={`-${(totals.overlap / 1e6).toFixed(1)}M`} variant="danger" />}
            <StatCard title="Converged" value={`${(totals.convergedTotal / 1e6).toFixed(1)}M`} trend="up" change={4.1} variant="success" />
            <div className="card p-4"><div className="text-xs text-gray-500 mb-1">Confidence</div><div className="text-2xl font-bold">96<span className="text-sm text-gray-400">/100</span></div><div className="mt-2 h-2 bg-gray-200 rounded-full"><div className="h-full w-[96%] bg-green-500 rounded-full"></div></div></div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 card"><div className="card-header flex items-center justify-between"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /> Monthly Trend</div><div className="flex items-center gap-4 text-xs"><span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Linear</span><span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded"></span> Digital</span></div></div><div className="card-body"><StackedAreaChart data={chartData} height={220} /></div></div>
            <div className="card"><div className="card-header flex items-center gap-2"><BarChart3 size={18} className="text-primary-600" /> By Network</div><div className="card-body"><HorizontalBarChart data={networkSummary.slice(0, 5)} height={220} /></div></div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-semibold">Forecast Grid</span>{totals.overrideCount > 0 && <Badge variant="warning">{totals.overrideCount} overrides</Badge>}</div><span className="text-xs text-gray-500">Double-click row for details</span></div>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-700 w-[200px]">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 w-[80px]">Channel</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 w-[100px]">System</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700 w-[120px]">Range</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 w-[100px]">Override</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 w-[80px]">Delta</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700 w-[80px]">Conf</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700 w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {networks.filter((n) => selectedNetworks.includes(n)).map((network) => {
                  const networkRows = filteredRows.filter((r) => r.network === network);
                  if (networkRows.length === 0) return null;
                  const isExpanded = expandedNetworks.has(network);
                  const networkTotal = networkRows.reduce((sum, r) => sum + (r.override ?? r.systemForecast), 0);
                  const hasOverrides = networkRows.some((r) => r.override);
                  return (
                    <React.Fragment key={network}>
                      <tr className="bg-gray-100 cursor-pointer hover:bg-gray-200 border-b border-gray-200" onClick={() => toggleNetwork(network)}>
                        <td className="px-4 py-3 font-semibold"><div className="flex items-center gap-2">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}{network} <span className="text-xs text-gray-500 font-normal">({networkRows.length})</span></div></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right font-semibold">{(networkTotal / 1e6).toFixed(2)}M</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right">{hasOverrides && <Badge variant="warning">Modified</Badge>}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                      {isExpanded && networkRows.map((row) => (
                        <tr key={row.id} className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${row.override ? 'bg-yellow-50' : ''}`} onDoubleClick={() => openDetailModal(row)}>
                          <td className="px-4 py-2 pl-10"><div className="flex items-center gap-2">{row.product}{row.risk !== 'none' && <AlertTriangle size={14} className="text-yellow-500" />}</div></td>
                          <td className="px-4 py-2"><Badge variant={row.channel === 'Linear' ? 'primary' : 'secondary'}>{row.channel}</Badge></td>
                          <td className="px-4 py-2 text-right text-gray-600">{(row.systemForecast / 1e6).toFixed(2)}M</td>
                          <td className="px-4 py-2 text-center text-xs text-gray-500">{(row.p10 / 1e6).toFixed(2)} - {(row.p90 / 1e6).toFixed(2)}M</td>
                          <td className="px-4 py-2 text-right">{row.override ? <span className="font-medium text-yellow-700">{(row.override / 1e6).toFixed(2)}M</span> : <span className="text-gray-300">-</span>}</td>
                          <td className="px-4 py-2 text-right">{row.override && <span className={row.override > row.systemForecast ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{row.override > row.systemForecast ? '+' : ''}{(((row.override - row.systemForecast) / row.systemForecast) * 100).toFixed(1)}%</span>}</td>
                          <td className="px-4 py-2 text-center"><Badge variant={row.confidence === 'high' ? 'success' : row.confidence === 'medium' ? 'warning' : 'danger'}>{row.confidence}</Badge></td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {permission.canEdit && <button onClick={(e) => { e.stopPropagation(); openOverrideModal(row); }} className="p-1 hover:bg-gray-200 rounded" title="Override"><Edit3 size={14} /></button>}
                              {row.override && permission.canEdit && <button onClick={(e) => { e.stopPropagation(); handleResetOverride(row.id); }} className="p-1 hover:bg-red-100 rounded text-red-500" title="Reset"><X size={14} /></button>}
                              <button onClick={(e) => { e.stopPropagation(); setShowHistory(true); }} className="p-1 hover:bg-gray-200 rounded" title="History"><History size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showOverrideModal && overrideTargetRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOverrideModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[450px]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-lg font-semibold">Override Forecast</h3><button onClick={() => setShowOverrideModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4"><div className="font-medium text-gray-900">{overrideTargetRow.network} - {overrideTargetRow.product}</div><div className="flex items-center gap-2 mt-1"><Badge variant={overrideTargetRow.channel === 'Linear' ? 'primary' : 'secondary'}>{overrideTargetRow.channel}</Badge><span className="text-sm text-gray-500">System: {(overrideTargetRow.systemForecast / 1e6).toFixed(2)}M</span></div></div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Override Type</label><select value={overrideType} onChange={(e) => setOverrideType(e.target.value as typeof overrideType)} className="input w-full"><option value="absolute">Absolute Value</option><option value="uplift">% Uplift/Discount</option><option value="cap">Cap (max)</option><option value="floor">Floor (min)</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Value</label><input type="number" value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} placeholder={overrideType === 'uplift' ? 'e.g. 10 for +10%' : 'Impressions'} className="input w-full" autoFocus /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label><select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)} className="input w-full"><option value="">Select...</option>{overrideReasons.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"><button onClick={() => setShowOverrideModal(false)} className="btn-secondary">Cancel</button><button onClick={handleOverrideSave} disabled={!overrideValue || !selectedReason} className="btn-primary disabled:opacity-50"><Check size={16} className="mr-1 inline" /> Apply</button></div>
          </div>
        </div>
      )}

      {showDetailModal && detailRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[550px]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-lg font-semibold">Forecast Details</h3><button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4"><div className="font-medium text-lg text-gray-900">{detailRow.network} - {detailRow.product}</div><div className="flex items-center gap-2 mt-1"><Badge variant={detailRow.channel === 'Linear' ? 'primary' : 'secondary'}>{detailRow.channel}</Badge><Badge variant={detailRow.confidence === 'high' ? 'success' : detailRow.confidence === 'medium' ? 'warning' : 'danger'}>{detailRow.confidence}</Badge>{detailRow.risk !== 'none' && <Badge variant="danger">Risk</Badge>}</div></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg"><div className="text-xs text-blue-600 font-medium">System Forecast</div><div className="text-2xl font-bold text-blue-700">{(detailRow.systemForecast / 1e6).toFixed(2)}M</div><div className="text-xs text-blue-500 mt-1">Range: {(detailRow.p10 / 1e6).toFixed(2)} - {(detailRow.p90 / 1e6).toFixed(2)}M</div></div>
                <div className={`p-4 rounded-lg ${detailRow.override ? 'bg-yellow-50' : 'bg-gray-100'}`}><div className="text-xs text-gray-600 font-medium">Final Value</div><div className={`text-2xl font-bold ${detailRow.override ? 'text-yellow-700' : 'text-gray-700'}`}>{((detailRow.override ?? detailRow.systemForecast) / 1e6).toFixed(2)}M</div>{detailRow.override && <div className="flex items-center gap-1 text-xs mt-1">{detailRow.override > detailRow.systemForecast ? <TrendingUp size={12} className="text-green-600" /> : <TrendingDown size={12} className="text-red-600" />}<span className={detailRow.override > detailRow.systemForecast ? 'text-green-600' : 'text-red-600'}>{(((detailRow.override - detailRow.systemForecast) / detailRow.systemForecast) * 100).toFixed(1)}%</span></div>}</div>
              </div>
              <div className="mb-4"><div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={16} /> Monthly Breakdown</div><div className="bg-gray-50 rounded-lg p-4"><MiniBarChart data={detailRow.monthlyTrend} color={detailRow.channel === 'Linear' ? '#3b82f6' : '#8b5cf6'} /><div className="grid grid-cols-6 gap-2 mt-3 text-center">{detailRow.monthlyTrend.map((v, i) => (<div key={i}><div className="text-xs text-gray-500">{monthLabels[i]}</div><div className="text-sm font-semibold">{(v / 1e6).toFixed(2)}M</div></div>))}</div></div></div>
              {detailRow.override && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><div className="text-sm font-medium text-yellow-800 mb-1">Override Applied</div><div className="text-sm text-yellow-700">Type: {detailRow.overrideType}</div><div className="text-sm text-yellow-700">Reason: {detailRow.overrideReason}</div></div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between"><button onClick={() => { setShowDetailModal(false); openOverrideModal(detailRow); }} className="btn-secondary"><Edit3 size={14} className="mr-1 inline" /> {detailRow.override ? 'Edit' : 'Add'} Override</button><button onClick={() => setShowDetailModal(false)} className="btn-primary">Close</button></div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50" onClick={() => setShowHistory(false)}>
          <div className="w-96 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between"><h3 className="font-semibold">Override History</h3><button onClick={() => setShowHistory(false)}><X size={18} /></button></div>
            <div className="p-4 space-y-3"><div className="p-3 border border-gray-200 rounded-lg"><div className="text-sm font-medium">ABC Prime - Linear</div><div className="text-xs text-gray-500 mt-1">John Smith - 2 hours ago</div><div className="text-xs mt-2">System: 2.4M → Override: 2.7M (+12.5%)</div><div className="text-xs text-gray-500 mt-1">Reason: Tentpole event</div></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
