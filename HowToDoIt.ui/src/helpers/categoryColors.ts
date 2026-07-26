export const CATEGORY_COLORS = [
  '#7c3aed', // purple
  '#15803d', // green
  '#92400e', // brown
  '#b91c1c', // dark red
  '#1d4ed8', // blue
  '#0369a1', // steel blue
  '#0ea5e9', // sky blue
  '#0284c7', // medium blue
];

export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function buildCategoryColorMap(categoryIds: number[]): Map<number, string> {
  const map = new Map<number, string>();
  categoryIds.forEach((id, i) => map.set(id, getCategoryColor(i)));
  return map;
}
