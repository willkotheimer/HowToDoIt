import { describe, it, expect } from 'vitest';
import { parseChoreDescription } from '../ChoreInfoHelper';

describe('parseChoreDescription', () => {
  const cases: { desc: string; input: string; expected: string[] }[] = [
    {
      desc: 'splits a description into steps on period characters',
      input: 'Step one. Step two. Step three',
      expected: ['Step one', ' Step two', ' Step three'],
    },
    {
      desc: 'filters out numeric-only segments',
      input: 'Clean the counter.1.Rinse with water',
      expected: ['Clean the counter', 'Rinse with water'],
    },
    {
      desc: 'returns a single-element array when there are no periods',
      input: 'Just do the thing',
      expected: ['Just do the thing'],
    },
    {
      desc: 'filters trailing empty segment when description ends with a period',
      input: 'Do this. And this.',
      expected: ['Do this', ' And this'],
    },
    {
      desc: 'filters empty segments from consecutive periods',
      input: 'Step one..Step two',
      expected: ['Step one', 'Step two'],
    },
    {
      desc: 'returns empty array for an empty string',
      // empty string splits to [''], Number('') === 0 so it is filtered out
      input: '',
      expected: [],
    },
    {
      desc: 'handles a description that is only periods',
      input: '...',
      expected: [],
    },
    {
      desc: 'preserves whitespace within steps',
      input: '  Scrub the sink.  Rinse well',
      expected: ['  Scrub the sink', '  Rinse well'],
    },
  ];

  it.each(cases)('$desc', ({ input, expected }) => {
    expect(parseChoreDescription(input)).toEqual(expected);
  });
});
