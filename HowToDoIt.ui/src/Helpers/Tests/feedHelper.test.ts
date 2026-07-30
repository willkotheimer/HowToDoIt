import { describe, it, expect } from 'vitest';
import { slug, sceneHeight, groupSequencesByDomain } from '../feedHelper';
import type { WorkSequence } from '../../Types';

// Minimal WorkSequence factory for grouping tests.
const seq = (id: number, domain?: string): WorkSequence => ({
  id,
  title: `Seq ${id}`,
  domain,
  isPublic: true,
});

describe('slug', () => {
  it('lowercases and dashes non-alphanumerics', () => {
    expect(slug('Coffee Shop')).toBe('coffee-shop');
    expect(slug('Online Store')).toBe('online-store');
  });

  it('collapses runs and trims leading/trailing dashes', () => {
    expect(slug('  Pack & Ship!  ')).toBe('pack-ship');
    expect(slug('A/B  C')).toBe('a-b-c');
  });
});

describe('sceneHeight', () => {
  it('scales with the step count', () => {
    expect(sceneHeight(1)).toBe('110vh');
    expect(sceneHeight(5)).toBe('350vh');
  });

  it('falls back to one screen when there are no steps', () => {
    expect(sceneHeight(0)).toBe('72vh');
  });
});

describe('groupSequencesByDomain', () => {
  it('groups by domain, ordered by id within and across groups', () => {
    const groups = groupSequencesByDomain([
      seq(3, 'Retail Store'),
      seq(1, 'Coffee Shop'),
      seq(2, 'Coffee Shop'),
    ]);
    expect(groups.map((g) => g.name)).toEqual(['Coffee Shop', 'Retail Store']);
    expect(groups[0].sequences.map((s) => s.id)).toEqual([1, 2]);
  });

  it('buckets a missing domain under "Other"', () => {
    const groups = groupSequencesByDomain([seq(1), seq(2, '')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Other');
    expect(groups[0].sequences).toHaveLength(2);
  });

  it('returns [] for no sequences', () => {
    expect(groupSequencesByDomain([])).toEqual([]);
  });
});
