import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChoresLeft from '../ChoresLeft';

describe('ChoresLeft', () => {
  it('renders each chore name', () => {
    const chores = [{ name: 'Dishes' }, { name: 'Vacuuming' }, { name: 'Laundry' }];
    render(<ChoresLeft choresLeft={chores} />);
    expect(screen.getByText('Dishes')).toBeInTheDocument();
    expect(screen.getByText('Vacuuming')).toBeInTheDocument();
    expect(screen.getByText('Laundry')).toBeInTheDocument();
  });

  it('renders the correct number of chore items', () => {
    const chores = [{ name: 'Dishes' }, { name: 'Vacuuming' }];
    render(<ChoresLeft choresLeft={chores} />);
    expect(document.querySelectorAll('.choresLeftItem')).toHaveLength(2);
  });

  it('renders an empty container when no chores are passed', () => {
    const { container } = render(<ChoresLeft choresLeft={[]} />);
    expect(document.querySelectorAll('.choresLeftItem')).toHaveLength(0);
    expect(container.querySelector('.choresLeft')).toBeInTheDocument();
  });

  it('renders a single chore correctly', () => {
    render(<ChoresLeft choresLeft={[{ name: 'Take out trash' }]} />);
    expect(screen.getByText('Take out trash')).toBeInTheDocument();
  });
});
