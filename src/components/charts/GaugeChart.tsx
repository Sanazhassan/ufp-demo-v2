import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  title?: string;
  unit?: string;
  thresholds?: { warning: number; danger: number };
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 160,
  title,
  unit = '%',
  thresholds = { warning: 70, danger: 90 },
}: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = size / 2;
    const thickness = 15;
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const angleRange = endAngle - startAngle;

    const g = svg
      .attr('width', size)
      .attr('height', size * 0.7)
      .append('g')
      .attr('transform', `translate(${radius},${radius * 0.8})`);

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(thickness / 2);

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#e5e7eb');

    // Value arc
    const normalizedValue = Math.min(Math.max(value, min), max);
    const valueAngle = startAngle + ((normalizedValue - min) / (max - min)) * angleRange;

    const valueArc = d3.arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(valueAngle)
      .cornerRadius(thickness / 2);

    let color = '#10b981';
    if (value >= thresholds.danger) {
      color = '#ef4444';
    } else if (value >= thresholds.warning) {
      color = '#f59e0b';
    }

    g.append('path')
      .attr('d', valueArc as any)
      .attr('fill', color);

    // Center value
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.1em')
      .attr('fill', '#1f2937')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text(value.toFixed(1));

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text(unit);

    // Min/Max labels
    g.append('text')
      .attr('x', -radius + 10)
      .attr('y', 20)
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .text(min);

    g.append('text')
      .attr('x', radius - 20)
      .attr('y', 20)
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .text(max);

  }, [value, min, max, size, unit, thresholds]);

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-xs font-medium text-gray-500 mb-1">{title}</h3>}
      <svg ref={svgRef} />
    </div>
  );
}
