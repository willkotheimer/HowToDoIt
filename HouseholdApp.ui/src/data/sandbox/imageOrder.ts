import { getSandbox, saveSandbox } from './store';

export function getSandboxImageOrder(choreId: number): number[] | null {
  return getSandbox().imageOrders[String(choreId)] ?? null;
}

export function setSandboxImageOrder(choreId: number, order: number[]): void {
  const s = getSandbox();
  s.imageOrders[String(choreId)] = order;
  saveSandbox(s);
}
