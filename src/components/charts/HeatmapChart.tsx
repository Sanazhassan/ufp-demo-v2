import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { HeatmapCell } from '../../types';

interface HeatmapChartProps {
  data: HeatmapCell[];
  height?: number;
  title?: string;
  colorScheme?: 'blue' | 'green' | 'diverging';
}

export function HeatmapChart({
  data,
  height = 300,
  title,
  colorScheme = 'blue',
}: HeatmapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 30, right: 60, bottom: 50, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xLabels = [...new Set(data.map(d => d.x))];
    const yLabels = [...new Set(data.map(d => d.y))];

    const xScale = d3.scaleBand()
      .domain(xLabels)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(yLabels)
      .range([0, innerHeight])
      .padding(0.05);

    const valueExtent = d3.extent(data, d => d.value) as [number, number];

    let colorScale: d3.ScaleSequential<string> | d3.ScaleDiverging<string>;
    if (colorScheme === 'diverging') {
      colorScale = d3.scaleDiverging<string>()
        .domain([valueExtent[0], 0, valueExtent[1]])
        .interpolator(d3.interpolateRdYlGn);
    } else if (colorScheme === 'green') {
      colorScale = d3.scaleSequential()
        .domain(valueExtent)
        .interpolator(d3.interpolateGreens);
    } else {
      colorScale = d3.scaleSequential()
        .domain(valueExtent)
        .interpolator(d3.interpolateBlues);
    }

    // Cells
    g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x)!)
      .attr('y', d => yScale(d.y)!)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#1f2937').attr('stroke-width', 2);
        tooltip
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY - 10}px`)
          .html(`<strong>${d.x} / ${d.y}</strong><br/>Value: ${d.label || d.value.toFixed(1)}`)
          .classed('hidden', false);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', 'none');
        tooltip.classed('hidden', true);
      });

    // Cell labels (for small datasets)
    if (data.length < 50) {
      g.selectAll('.cell-label')
        .data(data)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.x)! + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.y)! + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', d => {
          const bgColor = d3.color(colorScale(d.value));
          if (bgColor) {
            const rgb = bgColor.rgb();
            const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
            return luminance > 150 ? '#1f2937' : '#ffffff';
          }
          return '#1f2937';
        })
        .attr('font-size', '10px')
        .text(d => d.label || d.value.toFixed(1));
    }

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px');

    // Color legend
    const legendWidth = 15;
    const legendHeight = innerHeight;
    const legendScale = d3.scaleLinear()
      .domain(valueExtent)
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d => d3.format('.1f')(d as number));

    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 15}, 0)`);

    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '100%')
      .attr('y2', '0%');

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      const value = valueExtent[0] + offset * (valueExtent[1] - valueExtent[0]);
      gradient.append('stop')
        .attr('offset', `${offset * 100}%`)
        .attr('stop-color', colorScale(value));
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#heatmap-gradient)');

    legend.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px');

    // Tooltip
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'absolute hidden bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10');

    return () => {
      tooltip.remove();
    };

  }, [data, height, colorScheme]);

  return (
    <div ref={containerRef} className="relative w-full">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
