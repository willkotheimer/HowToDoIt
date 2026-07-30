import { describe, it, expect } from 'vitest';
import { sortBySortOrder, firstBySortOrder, reorderIds } from '../sequenceHelper';

describe('sortBySortOrder', () => {
  it('orders ascending by sortOrder', () => {
    const items = [{ sortOrder: 2 }, { sortOrder: 0 }, { sortOrder: 1 }];
    expect(sortBySortOrder(items).map((i) => i.sortOrder)).toEqual([0, 1, 2]);
  });

  it('treats missing/null sortOrder as 0', () => {
    const items = [{ id: 'a', sortOrder: 1 }, { id: 'b' }, { id: 'c', sortOrder: null }];
    // b and c (both 0) come before a (1); the 0-group keeps its input order (stable sort).
    expect(sortBySortOrder(items).map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('returns [] for null/undefined input', () => {
    expect(sortBySortOrder(undefined)).toEqual([]);
    expect(sortBySortOrder(null)).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const items = [{ sortOrder: 2 }, { sortOrder: 1 }];
    const copy = [...items];
    sortBySortOrder(items);
    expect(items).toEqual(copy);
  });
});

describe('firstBySortOrder', () => {
  it('returns the lowest-sortOrder item', () => {
    const items = [{ id: 'a', sortOrder: 3 }, { id: 'b', sortOrder: 1 }];
    expect(firstBySortOrder(items)?.id).toBe('b');
  });

  it('returns undefined when empty or nullish', () => {
    expect(firstBySortOrder([])).toBeUndefined();
    expect(firstBySortOrder(undefined)).toBeUndefined();
  });
});

describe('reorderIds', () => {
  it('moves an id later (+1) by swapping with its neighbour', () => {
    expect(reorderIds([10, 20, 30], 10, 1)).toEqual([20, 10, 30]);
  });

  it('moves an id earlier (-1) by swapping with its neighbour', () => {
    expect(reorderIds([10, 20, 30], 30, -1)).toEqual([10, 30, 20]);
  });

  it('returns null when moving the first item earlier (out of bounds)', () => {
    expect(reorderIds([10, 20, 30], 10, -1)).toBeNull();
  });

  it('returns null when moving the last item later (out of bounds)', () => {
    expect(reorderIds([10, 20, 30], 30, 1)).toBeNull();
  });

  it('returns null when the id is not present', () => {
    expect(reorderIds([10, 20], 99, 1)).toBeNull();
  });

  it('does not mutate the input array', () => {
    const ids = [10, 20, 30];
    reorderIds(ids, 10, 1);
    expect(ids).toEqual([10, 20, 30]);
  });
});
