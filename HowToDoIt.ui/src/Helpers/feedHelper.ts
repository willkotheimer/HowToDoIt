import type { WorkSequence } from '../Types';

// Feed-specific pure logic, extracted from Views/Feed so it can be unit-tested
// independently of the scrollytelling component.

// URL-safe slug for section anchors: lowercase, runs of non-alphanumerics
// collapse to a single dash, with no leading/trailing dashes.
export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Scroll height for a scrollytelling scene: enough distance for each step to
// dwell centred (~60vh apart) plus lead-in/out. Empty scenes get one screen.
export function sceneHeight(stepCount: number): string {
  return stepCount ? `${(stepCount - 1) * 60 + 110}vh` : '72vh';
}

export interface DomainGroup {
  name: string;
  sequences: WorkSequence[];
}

// Group sequences by domain (a missing domain becomes "Other"). Sequences are
// ordered by id within each group, and the groups themselves keep the order in
// which their first sequence appears — both stable, id-driven.
export function groupSequencesByDomain(sequences: WorkSequence[]): DomainGroup[] {
  const map = new Map<string, WorkSequence[]>();
  [...sequences].sort((a, b) => a.id - b.id).forEach((s) => {
    const d = s.domain || 'Other';
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(s);
  });
  return Array.from(map.entries()).map(([name, seqs]) => ({ name, sequences: seqs }));
}
