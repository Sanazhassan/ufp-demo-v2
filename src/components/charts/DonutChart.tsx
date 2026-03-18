import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  innerRadiusRatio?: number;
  title?: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 200,
  innerRadiusRatio = 0.65,
  title,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = size / 2;
    const innerRadius = radius * innerRadiusRatio;

    const colors = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']);

    const g = svg
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${radius},${radius})`);

    const pie = d3.pie<{ label: string; value: number; color?: string }>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number; color?: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 2);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color || colors(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    // Center text
    if (centerValue) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', centerLabel ? '-0.2em' : '0.35em')
        .attr('fill', '#1f2937')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .text(centerValue);

      if (centerLabel) {
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.2em')
          .attr('fill', '#6b7280')
          .attr('font-size', '12px')
          .text(centerLabel);
      }
    }

  }, [data, size, innerRadiusRatio, centerLabel, centerValue]);

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <svg ref={svgRef} />
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: item.color || d3.schemeCategory10[i % 10],
              }}
            />
            <span className="text-gray-600">{item.label}</span>
            <span className="text-gray-900 font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
