// Pure helpers for working with sequences, steps and step-images. This logic
// was duplicated inline across StepEditor, SequenceEditor and SequenceDetail
// (sort-by-sortOrder, pick the cover image, reorder by swapping neighbours);
// extracting it here removes the duplication and makes it unit-testable.

// Ascending sort by sortOrder (nullish treated as 0). Returns a NEW array so
// callers never mutate React Query cache data in place.
export function sortBySortOrder<T extends { sortOrder?: number | null }>(
  items?: T[] | null,
): T[] {
  return [...(items ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

// The first item once ordered by sortOrder — e.g. a step's cover image.
export function firstBySortOrder<T extends { sortOrder?: number | null }>(
  items?: T[] | null,
): T | undefined {
  return sortBySortOrder(items)[0];
}

// Move `targetId` one slot within the current id ordering by swapping it with
// its neighbour: direction -1 = earlier, +1 = later. Returns the new ordering,
// or null when the move is out of bounds or the id is not present (so callers
// can skip the reorder mutation entirely).
export function reorderIds(
  ids: number[],
  targetId: number,
  direction: -1 | 1,
): number[] | null {
  const from = ids.indexOf(targetId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
