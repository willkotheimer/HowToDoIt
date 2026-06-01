import type { Chore } from '../../Types';
import { getSandbox, saveSandbox } from './store';

// Normalize PascalCase API payload fields to camelCase for storage and display
function normalize(chore: Partial<Chore>): Partial<Chore> {
  return {
    name: chore.name ?? chore.Name,
    description: chore.description ?? chore.Description,
    houseHoldId: chore.houseHoldId ?? chore.HouseHoldId,
    category: chore.category ?? chore.Category,
  };
}

function applyEdit(chore: Chore, edits: Record<string, Partial<Chore>>): Chore {
  const override = edits[String(chore.id)];
  return override ? { ...chore, ...override } : chore;
}

// Sandbox chore IDs are negative so they never collide with real API IDs
export function addSandboxChore(chore: Partial<Chore>): Chore {
  const s = getSandbox();
  const id = -(s.nextId);
  s.nextId += 1;
  const stored: Chore = { id, ...normalize(chore) } as Chore;
  s.chores.push(stored);
  saveSandbox(s);
  return stored;
}

export function editSandboxChore(choreId: number, changes: Partial<Chore>): void {
  const s = getSandbox();
  const normalized = normalize(changes);
  if (choreId < 0) {
    const idx = s.chores.findIndex((c) => c.id === choreId);
    if (idx !== -1) s.chores[idx] = { ...s.chores[idx], ...normalized };
  } else {
    const key = String(choreId);
    s.choreEdits[key] = { ...s.choreEdits[key], ...normalized };
  }
  saveSandbox(s);
}

export function getSandboxChore(choreId: number): Chore | undefined {
  return getSandbox().chores.find((c) => c.id === choreId);
}

export function applyEditToChore(chore: Chore): Chore {
  return applyEdit(chore, getSandbox().choreEdits);
}

export function mergeSandboxChores(apiChores: Chore[]): Chore[] {
  const { chores, choreEdits } = getSandbox();
  return [...apiChores.map((c) => applyEdit(c, choreEdits)), ...chores];
}

export function mergeSandboxUnassigned(apiUnassigned: Chore[], week: number): Chore[] {
  const { chores, choreEdits, assignments } = getSandbox();
  const assignedIds = new Set(
    assignments.filter((a) => a.week === week).map((a) => String(a.choreId)),
  );
  const filteredReal = apiUnassigned
    .filter((c) => !assignedIds.has(String(c.id)))
    .map((c) => applyEdit(c, choreEdits));
  const unassignedSandbox = chores.filter((c) => !assignedIds.has(String(c.id)));
  return [...filteredReal, ...unassignedSandbox];
}
