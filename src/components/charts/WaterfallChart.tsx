import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { WaterfallItem } from '../../types';

interface WaterfallChartProps {
  data: WaterfallItem[];
  height?: number;
  title?: string;
}

export function WaterfallChart({ data, height = 300, title }: WaterfallChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate cumulative values
    let cumulative = 0;
    const processedData = data.map((d, i) => {
      const start = d.type === 'total' && i === 0 ? 0 : cumulative;
      const end = d.type === 'total' && i > 0 ? d.value : cumulative + d.value;
      if (d.type !== 'total') {
        cumulative += d.value;
      } else if (i === 0) {
        cumulative = d.value;
      }
      return { ...d, start, end };
    });

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const yMin = d3.min(processedData, (d) => Math.min(d.start, d.end))!;
    const yMax = d3.max(processedData, (d) => Math.max(d.start, d.end))!;
    const yPadding = (yMax - yMin) * 0.1;

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
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

    // Connector lines
    g.selectAll('.connector')
      .data(processedData.slice(0, -1))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d.label)! + xScale.bandwidth())
      .attr('x2', (_, i) => xScale(processedData[i + 1].label)!)
      .attr('y1', (d) => yScale(d.end))
      .attr('y2', (d) => yScale(d.end))
      .attr('stroke', '#9ca3af')
      .attr('stroke-dasharray', '2,2');

    // Bars
    g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.label)!)
      .attr('y', (d) => yScale(Math.max(d.start, d.end)))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => Math.abs(yScale(d.start) - yScale(d.end)))
      .attr('fill', (d) => {
        if (d.type === 'total') return '#3b82f6';
        return d.value >= 0 ? '#10b981' : '#ef4444';
      })
      .attr('rx', 2);

    // Value labels
    g.selectAll('.value-label')
      .data(processedData)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.label)! + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.end) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '11px')
      .attr('font-weight', 'medium')
      .text((d) => {
        const formatted = d3.format('.2s')(Math.abs(d.value));
        return d.type !== 'total' && d.value > 0 ? `+${formatted}` : formatted;
      });

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Y Axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(6)
          .tickFormat((d) => `$${d3.format('.2s')(d as number)}`)
      )
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

  }, [data, height]);

  return (
    <div ref={containerRef} className="w-full">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
