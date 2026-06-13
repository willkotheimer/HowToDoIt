import { describe, it, expect } from 'vitest';
import { parseSteps } from '../parseSteps';

describe('parseSteps', () => {
  // ── numbered list ─────────────────────────────────────────────────────────

  it('strips number prefixes from "1." style lists', () => {
    const input = '1. Turn on water\n2. Scrub the sides\n3. Rinse well';
    expect(parseSteps(input)).toEqual(['Turn on water', 'Scrub the sides', 'Rinse well']);
  });

  it('handles numbered list where steps end with periods', () => {
    const input = '1. Clean dishes.\n2. Clean out sink with soapy water.';
    expect(parseSteps(input)).toEqual(['Clean dishes.', 'Clean out sink with soapy water.']);
  });

  it('handles "1)" style numbering', () => {
    const input = '1) First step\n2) Second step';
    expect(parseSteps(input)).toEqual(['First step', 'Second step']);
  });

  it('handles a numbered list where the last step has no trailing period', () => {
    const input = '1. Make sure shoes are in rows.\n2. Tie shoelaces.\n3. Organize by type';
    expect(parseSteps(input)).toEqual([
      'Make sure shoes are in rows.',
      'Tie shoelaces.',
      'Organize by type',
    ]);
  });

  // ── dash / bullet list ────────────────────────────────────────────────────

  it('strips dash prefixes', () => {
    const input = '- Put in the corner.\n- Wipe it down';
    expect(parseSteps(input)).toEqual(['Put in the corner.', 'Wipe it down']);
  });

  it('handles bullet character', () => {
    const input = '• Step one\n• Step two';
    expect(parseSteps(input)).toEqual(['Step one', 'Step two']);
  });

  // ── newline-separated ─────────────────────────────────────────────────────

  it('splits on newlines when no list markers are present', () => {
    const input = 'Wash clothes.\nDry clothes.\nFold clothes.\nHang clothes.';
    expect(parseSteps(input)).toEqual([
      'Wash clothes.',
      'Dry clothes.',
      'Fold clothes.',
      'Hang clothes.',
    ]);
  });

  it('trims blank lines from newline-separated input', () => {
    const input = 'Step one\n\nStep two\n';
    expect(parseSteps(input)).toEqual(['Step one', 'Step two']);
  });

  // ── period-separated fallback ─────────────────────────────────────────────

  it('falls back to period splitting for a single-line sentence', () => {
    const input = 'Scrub the sink. Rinse well. Dry with cloth.';
    expect(parseSteps(input)).toEqual(['Scrub the sink', 'Rinse well', 'Dry with cloth']);
  });

  it('returns a single item when the input has no delimiters', () => {
    const input = 'Stack books and items neatly';
    expect(parseSteps(input)).toEqual(['Stack books and items neatly']);
  });

  // ── edge cases ────────────────────────────────────────────────────────────

  it('returns [] for an empty string', () => {
    expect(parseSteps('')).toEqual([]);
  });

  it('returns [] for a whitespace-only string', () => {
    expect(parseSteps('   ')).toEqual([]);
  });

  it('returns [] for null', () => {
    expect(parseSteps(null)).toEqual([]);
  });

  it('returns [] for undefined', () => {
    expect(parseSteps(undefined)).toEqual([]);
  });
});
