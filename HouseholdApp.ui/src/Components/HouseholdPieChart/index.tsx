import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];

interface Props {
  data: { label: string; value: number }[];
  outerRadius: number;
  innerRadius: number;
  width?: number;
  height?: number;
}

export default function HouseholdPieChart({ data, outerRadius, innerRadius, width, height }: Props) {
  const size = outerRadius * 2;
  return (
    <PieChart width={width ?? size} height={height ?? size}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="label"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        label={({ name, value }) => `${name}:${value}`}
      >
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
    </PieChart>
  );
}
