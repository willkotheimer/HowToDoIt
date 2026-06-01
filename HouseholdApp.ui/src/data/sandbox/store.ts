import type { Chore, Assignment } from '../../Types';

const SANDBOX_KEY = 'household_sandbox';

export interface SandboxState {
  chores: Chore[];
  choreEdits: Record<string, Partial<Chore>>;
  assignments: Assignment[];
  completedIds: number[];
  imageOrders: Record<string, number[]>;
  nextId: number;
}

const DEFAULT: SandboxState = {
  chores: [],
  choreEdits: {},
  assignments: [],
  completedIds: [],
  imageOrders: {},
  nextId: 1,
};

export function getSandbox(): SandboxState {
  try {
    const raw = localStorage.getItem(SANDBOX_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveSandbox(state: SandboxState): void {
  localStorage.setItem(SANDBOX_KEY, JSON.stringify(state));
}
