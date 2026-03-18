import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  horizontal?: boolean;
  title?: string;
  valueFormat?: (value: number) => string;
  showValues?: boolean;
}

export function BarChart({
  data,
  height = 250,
  horizontal = false,
  title,
  valueFormat = (v) => d3.format('.2s')(v),
  showValues = true,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = horizontal
      ? { top: 10, right: 60, bottom: 20, left: 100 }
      : { top: 10, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colors = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']);

    if (horizontal) {
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)! * 1.1])
        .range([0, innerWidth]);

      const yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.25);

      // Grid
      g.append('g')
        .call(
          d3.axisBottom(xScale)
            .tickSize(innerHeight)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '2,2');

      g.selectAll('.domain').remove();

      // Bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.label)!)
        .attr('width', d => xScale(d.value))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => d.color || colors(d.label))
        .attr('rx', 3);

      // Values
      if (showValues) {
        g.selectAll('.value')
          .data(data)
          .enter()
          .append('text')
          .attr('x', d => xScale(d.value) + 5)
          .attr('y', d => yScale(d.label)! + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#374151')
          .attr('font-size', '11px')
          .text(d => valueFormat(d.value));
      }

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .attr('fill', '#6b7280')
        .attr('font-size', '11px');

    } else {
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.25);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)! * 1.1])
        .range([innerHeight, 0]);

      // Grid
      g.append('g')
        .call(
          d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '2,2');

      g.selectAll('.domain').remove();

      // Bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.label)!)
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => d.color || colors(d.label))
        .attr('rx', 3);

      // Values
      if (showValues) {
        g.selectAll('.value')
          .data(data)
          .enter()
          .append('text')
          .attr('x', d => xScale(d.label)! + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.value) - 5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#374151')
          .attr('font-size', '11px')
          .text(d => valueFormat(d.value));
      }

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .attr('transform', 'rotate(-30)')
        .attr('text-anchor', 'end');

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => valueFormat(d as number)))
        .selectAll('text')
        .attr('fill', '#6b7280')
        .attr('font-size', '11px');
    }

  }, [data, height, horizontal, valueFormat, showValues]);

  return (
    <div ref={containerRef} className="w-full">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
