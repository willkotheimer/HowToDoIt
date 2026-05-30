import type { Category, Chore, Assignment } from '../Types';

export interface ChoreSelectOption {
  value: number;
  label: string;
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

export function buildChorePayload(
  values: { name: string; description: string; category: string; houseHoldId: number },
  choreId?: number,
): Partial<Chore> {
  const payload: Partial<Chore> = {
    Name: values.name,
    Description: values.description,
    HouseHoldId: values.houseHoldId,
    Category: parseInt(values.category, 10),
  };
  if (choreId !== undefined) payload.Id = choreId;
  return payload;
}

export function choresToSelectOptions(chores: Chore[]): ChoreSelectOption[] {
  return chores.map((c) => ({ value: c.id ?? 0, label: c.name ?? '' }));
}

export function filterAssignmentsByWeek(assignments: Assignment[], week: number): Assignment[] {
  return assignments.filter((a) => a.week === week);
}

export function filterAssignmentsByUser(assignments: Assignment[], userId: number): Assignment[] {
  return assignments.filter((a) => a.userId === userId);
}
