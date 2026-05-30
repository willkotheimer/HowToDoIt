import { describe, it, expect } from 'vitest';
import {
  sortCategories,
  buildChorePayload,
  choresToSelectOptions,
  filterAssignmentsByWeek,
  filterAssignmentsByUser,
} from '../FormsHelper';
import type { Category, Assignment } from '../../Types';

// ─── sortCategories ──────────────────────────────────────────────────────────

describe('sortCategories', () => {
  const cases: { desc: string; input: Category[]; expected: Category[] }[] = [
    {
      desc: 'sorts two items alphabetically',
      input: [{ id: 1, categoryName: 'Kitchen' }, { id: 2, categoryName: 'Bathroom' }],
      expected: [{ id: 2, categoryName: 'Bathroom' }, { id: 1, categoryName: 'Kitchen' }],
    },
    {
      desc: 'leaves already-sorted list unchanged',
      input: [{ id: 1, categoryName: 'Attic' }, { id: 2, categoryName: 'Bathroom' }],
      expected: [{ id: 1, categoryName: 'Attic' }, { id: 2, categoryName: 'Bathroom' }],
    },
    {
      desc: 'handles a single-element list',
      input: [{ id: 1, categoryName: 'Garage' }],
      expected: [{ id: 1, categoryName: 'Garage' }],
    },
    {
      desc: 'handles an empty list',
      input: [],
      expected: [],
    },
    {
      desc: 'sorts more than two items',
      input: [
        { id: 1, categoryName: 'Yard' },
        { id: 2, categoryName: 'Attic' },
        { id: 3, categoryName: 'Kitchen' },
      ],
      expected: [
        { id: 2, categoryName: 'Attic' },
        { id: 3, categoryName: 'Kitchen' },
        { id: 1, categoryName: 'Yard' },
      ],
    },
  ];

  it.each(cases)('$desc', ({ input, expected }) => {
    expect(sortCategories(input)).toEqual(expected);
  });

  it('does not mutate the original array', () => {
    const input: Category[] = [{ id: 1, categoryName: 'Kitchen' }, { id: 2, categoryName: 'Attic' }];
    const snapshot = [...input];
    sortCategories(input);
    expect(input).toEqual(snapshot);
  });
});

// ─── buildChorePayload ───────────────────────────────────────────────────────

describe('buildChorePayload', () => {
  const cases: {
    desc: string;
    values: { name: string; description: string; category: string; houseHoldId: number };
    choreId: number | undefined;
    expected: object;
  }[] = [
    {
      desc: 'builds a new-chore payload without an Id field',
      values: { name: 'Dishes', description: 'Wash the dishes', category: '3', houseHoldId: 1 },
      choreId: undefined,
      expected: { Name: 'Dishes', Description: 'Wash the dishes', HouseHoldId: 1, Category: 3 },
    },
    {
      desc: 'includes Id when updating an existing chore',
      values: { name: 'Dishes', description: 'Wash the dishes', category: '3', houseHoldId: 1 },
      choreId: 42,
      expected: { Name: 'Dishes', Description: 'Wash the dishes', HouseHoldId: 1, Category: 3, Id: 42 },
    },
    {
      desc: 'parses category string to an integer',
      values: { name: 'Vacuuming', description: 'Vacuum floors', category: '7', houseHoldId: 2 },
      choreId: undefined,
      expected: { Name: 'Vacuuming', Description: 'Vacuum floors', HouseHoldId: 2, Category: 7 },
    },
    {
      desc: 'includes Id when choreId is 0',
      values: { name: 'Test', description: 'Desc', category: '1', houseHoldId: 1 },
      choreId: 0,
      expected: { Name: 'Test', Description: 'Desc', HouseHoldId: 1, Category: 1, Id: 0 },
    },
    {
      desc: 'preserves empty string values from the form',
      values: { name: '', description: '', category: '1', houseHoldId: 0 },
      choreId: undefined,
      expected: { Name: '', Description: '', HouseHoldId: 0, Category: 1 },
    },
  ];

  it.each(cases)('$desc', ({ values, choreId, expected }) => {
    expect(buildChorePayload(values, choreId)).toEqual(expected);
  });
});

// ─── choresToSelectOptions ───────────────────────────────────────────────────

describe('choresToSelectOptions', () => {
  const cases: { desc: string; input: object[]; expected: object[] }[] = [
    {
      desc: 'maps a chore to a value/label option',
      input: [{ id: 1, name: 'Dishes' }],
      expected: [{ value: 1, label: 'Dishes' }],
    },
    {
      desc: 'defaults value to 0 when id is undefined',
      input: [{ name: 'Dishes' }],
      expected: [{ value: 0, label: 'Dishes' }],
    },
    {
      desc: 'defaults label to empty string when name is undefined',
      input: [{ id: 5 }],
      expected: [{ value: 5, label: '' }],
    },
    {
      desc: 'returns an empty array for empty input',
      input: [],
      expected: [],
    },
    {
      desc: 'maps multiple chores in order',
      input: [{ id: 1, name: 'Dishes' }, { id: 2, name: 'Vacuuming' }],
      expected: [{ value: 1, label: 'Dishes' }, { value: 2, label: 'Vacuuming' }],
    },
  ];

  it.each(cases)('$desc', ({ input, expected }) => {
    expect(choresToSelectOptions(input as any)).toEqual(expected);
  });
});

// ─── filterAssignmentsByWeek ─────────────────────────────────────────────────

describe('filterAssignmentsByWeek', () => {
  const pool: Assignment[] = [
    { id: 1, userId: 10, week: 5, isCompleted: false, rating: 0, choreId: 1 },
    { id: 2, userId: 11, week: 6, isCompleted: false, rating: 0, choreId: 2 },
    { id: 3, userId: 10, week: 5, isCompleted: true,  rating: 5, choreId: 3 },
    { id: 4, userId: 12, week: 7, isCompleted: false, rating: 0, choreId: 4 },
  ];

  const cases: { desc: string; week: number; expectedIds: (number | undefined)[] }[] = [
    {
      desc: 'returns all assignments matching the week',
      week: 5,
      expectedIds: [1, 3],
    },
    {
      desc: 'returns a single match for an unshared week',
      week: 7,
      expectedIds: [4],
    },
    {
      desc: 'returns empty array when no assignment matches',
      week: 99,
      expectedIds: [],
    },
  ];

  it.each(cases)('$desc', ({ week, expectedIds }) => {
    expect(filterAssignmentsByWeek(pool, week).map((a) => a.id)).toEqual(expectedIds);
  });

  it('returns empty array when given empty input', () => {
    expect(filterAssignmentsByWeek([], 5)).toEqual([]);
  });
});

// ─── filterAssignmentsByUser ─────────────────────────────────────────────────

describe('filterAssignmentsByUser', () => {
  const pool: Assignment[] = [
    { id: 1, userId: 10, week: 5, isCompleted: false, rating: 0, choreId: 1 },
    { id: 2, userId: 11, week: 5, isCompleted: false, rating: 0, choreId: 2 },
    { id: 3, userId: 10, week: 6, isCompleted: true,  rating: 5, choreId: 3 },
    { id: 4, userId: 12, week: 5, isCompleted: false, rating: 0, choreId: 4 },
  ];

  const cases: { desc: string; userId: number; expectedIds: (number | undefined)[] }[] = [
    {
      desc: 'returns all assignments belonging to the user',
      userId: 10,
      expectedIds: [1, 3],
    },
    {
      desc: 'returns a single match when user has one assignment',
      userId: 12,
      expectedIds: [4],
    },
    {
      desc: 'returns empty array for a user with no assignments',
      userId: 99,
      expectedIds: [],
    },
  ];

  it.each(cases)('$desc', ({ userId, expectedIds }) => {
    expect(filterAssignmentsByUser(pool, userId).map((a) => a.id)).toEqual(expectedIds);
  });

  it('returns empty array when given empty input', () => {
    expect(filterAssignmentsByUser([], 10)).toEqual([]);
  });
});
