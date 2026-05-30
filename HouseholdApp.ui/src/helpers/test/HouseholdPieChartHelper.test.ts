import { describe, it, expect } from 'vitest';
import { buildPieConfig } from '../HouseholdPieChartHelper';

const radiusCases: { desc: string; innerRadius: number; outerRadius: number }[] = [
  { desc: 'standard donut chart',       innerRadius: 20,  outerRadius: 100 },
  { desc: 'full pie (zero inner)',       innerRadius: 0,   outerRadius: 150 },
  { desc: 'small chart',                innerRadius: 10,  outerRadius: 50  },
  { desc: 'large chart',                innerRadius: 50,  outerRadius: 300 },
];

describe('buildPieConfig — returned object shape', () => {
  it.each(radiusCases)('$desc ($innerRadius / $outerRadius) returns all four D3 primitives', ({ innerRadius, outerRadius }) => {
    const config = buildPieConfig(innerRadius, outerRadius);
    expect(typeof config.pie).toBe('function');
    expect(typeof config.arc).toBe('function');
    expect(typeof config.colors).toBe('function');
    expect(typeof config.format).toBe('function');
  });
});

describe('buildPieConfig — pie function behaviour', () => {
  const sampleData = [
    { label: 'Alice', value: 30 },
    { label: 'Bob',   value: 70 },
  ];

  it.each(radiusCases)('$desc — pie returns one slice per data point', ({ innerRadius, outerRadius }) => {
    const { pie } = buildPieConfig(innerRadius, outerRadius);
    const slices = pie(sampleData);
    expect(slices).toHaveLength(sampleData.length);
  });

  it.each(radiusCases)('$desc — each slice has startAngle and endAngle', ({ innerRadius, outerRadius }) => {
    const { pie } = buildPieConfig(innerRadius, outerRadius);
    const slices = pie(sampleData);
    slices.forEach((slice) => {
      expect(slice).toHaveProperty('startAngle');
      expect(slice).toHaveProperty('endAngle');
      expect(typeof slice.startAngle).toBe('number');
      expect(typeof slice.endAngle).toBe('number');
    });
  });

  it.each(radiusCases)('$desc — slices span the full circle (0 to 2π)', ({ innerRadius, outerRadius }) => {
    const { pie } = buildPieConfig(innerRadius, outerRadius);
    const slices = pie(sampleData);
    const first = slices[0];
    const last  = slices[slices.length - 1];
    expect(first.startAngle).toBeCloseTo(0);
    expect(last.endAngle).toBeCloseTo(Math.PI * 2);
  });

  it.each(radiusCases)('$desc — slice values match input data', ({ innerRadius, outerRadius }) => {
    const { pie } = buildPieConfig(innerRadius, outerRadius);
    pie(sampleData).forEach((slice, i) => {
      expect(slice.value).toBe(sampleData[i].value);
    });
  });
});

describe('buildPieConfig — color scale', () => {
  it.each(radiusCases)('$desc — colors returns a string for numeric indices', ({ innerRadius, outerRadius }) => {
    const { colors } = buildPieConfig(innerRadius, outerRadius);
    expect(typeof colors(0 as any)).toBe('string');
    expect(typeof colors(1 as any)).toBe('string');
  });

  it('assigns distinct colors to different indices', () => {
    const { colors } = buildPieConfig(0, 100);
    expect(colors(0 as any)).not.toBe(colors(1 as any));
  });
});

describe('buildPieConfig — format function', () => {
  it.each(radiusCases)('$desc — format returns a string for a given number', ({ innerRadius, outerRadius }) => {
    const { format } = buildPieConfig(innerRadius, outerRadius);
    expect(typeof format(42)).toBe('string');
  });
});
