import { describe, it, expect } from 'vitest';
import { mergeAssignmentsWithImages } from '../AccordionHelper';

describe('mergeAssignmentsWithImages', () => {
  const cases: {
    desc: string;
    assignments: object[];
    images: object[];
    expected: object[];
  }[] = [
    {
      desc: 'attaches the image url when choreId matches',
      assignments: [{ choreId: 1, chorename: 'Dishes' }],
      images:      [{ choreId: 1, image: 'https://cdn.example.com/dishes.jpg' }],
      expected:    [{ choreId: 1, chorename: 'Dishes', image: 'https://cdn.example.com/dishes.jpg' }],
    },
    {
      desc: 'leaves assignment unchanged when no image matches its choreId',
      assignments: [{ choreId: 1, chorename: 'Dishes' }],
      images:      [{ choreId: 2, image: 'https://cdn.example.com/other.jpg' }],
      expected:    [{ choreId: 1, chorename: 'Dishes' }],
    },
    {
      desc: 'handles multiple assignments where only some have images',
      assignments: [
        { choreId: 1, chorename: 'Dishes' },
        { choreId: 2, chorename: 'Vacuuming' },
        { choreId: 3, chorename: 'Laundry' },
      ],
      images: [
        { choreId: 1, image: 'https://cdn.example.com/dishes.jpg' },
        { choreId: 3, image: 'https://cdn.example.com/laundry.jpg' },
      ],
      expected: [
        { choreId: 1, chorename: 'Dishes',    image: 'https://cdn.example.com/dishes.jpg' },
        { choreId: 2, chorename: 'Vacuuming' },
        { choreId: 3, chorename: 'Laundry',   image: 'https://cdn.example.com/laundry.jpg' },
      ],
    },
    {
      desc: 'returns empty array when assignments is empty',
      assignments: [],
      images:      [{ choreId: 1, image: 'https://cdn.example.com/dishes.jpg' }],
      expected:    [],
    },
    {
      desc: 'returns assignments unchanged when images is empty',
      assignments: [{ choreId: 1, chorename: 'Dishes' }],
      images:      [],
      expected:    [{ choreId: 1, chorename: 'Dishes' }],
    },
    {
      desc: 'uses the first matching image when multiple images share a choreId',
      assignments: [{ choreId: 1, chorename: 'Dishes' }],
      images: [
        { choreId: 1, image: 'https://cdn.example.com/first.jpg' },
        { choreId: 1, image: 'https://cdn.example.com/second.jpg' },
      ],
      expected: [{ choreId: 1, chorename: 'Dishes', image: 'https://cdn.example.com/first.jpg' }],
    },
  ];

  it.each(cases)('$desc', ({ assignments, images, expected }) => {
    expect(mergeAssignmentsWithImages(assignments, images)).toEqual(expected);
  });

  it('does not mutate the input assignments array', () => {
    const assignments = [{ choreId: 1, chorename: 'Dishes' }];
    const images      = [{ choreId: 1, image: 'https://cdn.example.com/dishes.jpg' }];
    const snapshot    = JSON.parse(JSON.stringify(assignments));
    mergeAssignmentsWithImages(assignments, images);
    expect(assignments).toEqual(snapshot);
  });
});
