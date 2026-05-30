import * as d3 from 'd3';

export function buildPieConfig(innerRadius: number, outerRadius: number) {
  const pie = d3.pie<{ label: string; value: number }>().value((d) => d.value).sort(null);
  const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
  const colors = d3.scaleOrdinal(d3.schemeCategory10);
  const format = d3.format('20');
  return { pie, arc, colors, format };
}
