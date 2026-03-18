import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ForecastPoint, ModelContribution } from '../../types';

interface TrendChartProps {
  data: ForecastPoint[];
  actuals?: ForecastPoint[];
  models?: ModelContribution[];
  showConfidence?: boolean;
  showModels?: boolean;
  height?: number;
  title?: string;
}

export function TrendChart({
  data,
  actuals,
  models,
  showConfidence = true,
  showModels = false,
  height = 300,
  title,
}: TrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 120, bottom: 40, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, innerWidth]);

    const allValues = [
      ...data.map((d) => d.value),
      ...data.filter((d) => d.upper95).map((d) => d.upper95!),
      ...data.filter((d) => d.lower95).map((d) => d.lower95!),
      ...(actuals?.map((d) => d.value) || []),
    ];

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues)! * 0.95, d3.max(allValues)! * 1.05])
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2');

    g.selectAll('.grid .domain').remove();

    // Confidence bands
    if (showConfidence && data[0]?.upper95) {
      const area95 = d3.area<ForecastPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y0((d) => yScale(d.lower95!))
        .y1((d) => yScale(d.upper95!))
        .curve(d3.curveMonotoneX);

      const area80 = d3.area<ForecastPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y0((d) => yScale(d.lower80!))
        .y1((d) => yScale(d.upper80!))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', '#3b82f6')
        .attr('fill-opacity', 0.1)
        .attr('d', area95);

      g.append('path')
        .datum(data)
        .attr('fill', '#3b82f6')
        .attr('fill-opacity', 0.15)
        .attr('d', area80);
    }

    // Model lines
    if (showModels && models) {
      const modelColors = {
        ARIMA: '#10b981',
        Prophet: '#f59e0b',
        XGBoost: '#ef4444',
        LSTM: '#8b5cf6',
      };

      models.forEach((model) => {
        const line = d3.line<number>()
          .x((_, i) => xScale(new Date(data[i].date)))
          .y((d) => yScale(d))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(model.contribution)
          .attr('fill', 'none')
          .attr('stroke', modelColors[model.model])
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,2')
          .attr('stroke-opacity', 0.6)
          .attr('d', line);
      });
    }

    // Main forecast line
    const line = d3.line<ForecastPoint>()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Actuals line
    if (actuals && actuals.length > 0) {
      const actualsLine = d3.line<ForecastPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(actuals)
        .attr('fill', 'none')
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 2)
        .attr('d', actualsLine);

      g.selectAll('.actual-dot')
        .data(actuals)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(new Date(d.date)))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 3)
        .attr('fill', '#1f2937');
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(d3.timeWeek.every(2))
          .tickFormat((d) => d3.timeFormat('%b %d')(d as Date))
      )
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(6)
          .tickFormat((d) => d3.format('.2s')(d as number))
      )
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    // Legend
    const legendData = [
      { label: 'Ensemble Forecast', color: '#3b82f6', dash: false },
      ...(actuals ? [{ label: 'Actuals', color: '#1f2937', dash: false }] : []),
      ...(showConfidence ? [{ label: '80% CI', color: '#3b82f6', opacity: 0.15 }] : []),
      ...(showConfidence ? [{ label: '95% CI', color: '#3b82f6', opacity: 0.1 }] : []),
    ];

    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 0)`);

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);

      if ('opacity' in item && item.opacity !== undefined) {
        legendItem.append('rect')
          .attr('width', 16)
          .attr('height', 10)
          .attr('fill', item.color)
          .attr('fill-opacity', item.opacity);
      } else {
        legendItem.append('line')
          .attr('x1', 0)
          .attr('x2', 16)
          .attr('y1', 5)
          .attr('y2', 5)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', item.dash ? '4,2' : '0');
      }

      legendItem.append('text')
        .attr('x', 22)
        .attr('y', 9)
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .text(item.label);
    });

    // Tooltip
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'absolute hidden bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10');

    const bisect = d3.bisector<ForecastPoint, Date>((d) => new Date(d.date)).left;

    svg.on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      const x0 = xScale.invert(mx - margin.left);
      const i = bisect(data, x0, 1);
      const d = data[Math.min(i, data.length - 1)];
      
      if (d) {
        tooltip
          .style('left', `${mx + 10}px`)
          .style('top', `${event.offsetY - 10}px`)
          .html(`<strong>${d.date}</strong><br/>Forecast: ${d3.format(',.0f')(d.value)}`)
          .classed('hidden', false);
      }
    });

    svg.on('mouseleave', () => {
      tooltip.classed('hidden', true);
    });

    return () => {
      tooltip.remove();
    };
  }, [data, actuals, models, showConfidence, showModels, height]);

  return (
    <div ref={containerRef} className="relative w-full">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
