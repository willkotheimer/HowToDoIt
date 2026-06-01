import type { Assignment } from '../../Types';
import { getSandbox, saveSandbox } from './store';

function withCompletedFlag(assignment: Assignment, completedIds: number[]): Assignment {
  return completedIds.includes(assignment.id ?? -Infinity)
    ? { ...assignment, isCompleted: true }
    : assignment;
}

export function addSandboxAssignment(assignment: Partial<Assignment> & { chorename?: string; firstname?: string }): void {
  const s = getSandbox();
  const id = -(s.nextId);
  s.nextId += 1;
  s.assignments.push({
    id,
    userId: assignment.userId ?? 0,
    week: assignment.week ?? 0,
    isCompleted: false,
    rating: 0,
    choreId: assignment.choreId ?? 0,
    chorename: assignment.chorename ?? '',
    ...(assignment.firstname ? { firstname: assignment.firstname } : {}),
  } as Assignment);
  saveSandbox(s);
}

export function completeSandboxAssignment(assignmentId: number): void {
  const s = getSandbox();
  if (assignmentId < 0) {
    const idx = s.assignments.findIndex((a) => a.id === assignmentId);
    if (idx !== -1) s.assignments[idx] = { ...s.assignments[idx], isCompleted: true };
  } else if (!s.completedIds.includes(assignmentId)) {
    s.completedIds.push(assignmentId);
  }
  saveSandbox(s);
}

export function mergeSandboxAssignments(apiAssignments: Assignment[]): Assignment[] {
  const { assignments, completedIds } = getSandbox();
  return [
    ...apiAssignments.map((a) => withCompletedFlag(a, completedIds)),
    ...assignments,
  ];
}

export function mergeSandboxAssignmentsForUser(apiAssignments: Assignment[], userId: number): Assignment[] {
  const { assignments, completedIds } = getSandbox();
  return [
    ...apiAssignments.map((a) => withCompletedFlag(a, completedIds)),
    ...assignments.filter((a) => a.userId === userId),
  ];
}
