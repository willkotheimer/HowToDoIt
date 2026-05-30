import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChoresInfo from '../ChoreInfo';

describe('ChoreInfo', () => {
  const baseChore = {
    name: 'Wash Dishes',
    description: 'Rinse the plates. Scrub with soap. Dry with a towel',
  };

  it('renders the chore name', () => {
    render(<ChoresInfo choreInfo={baseChore} />);
    expect(screen.getByText(/Wash Dishes/)).toBeInTheDocument();
  });

  it('renders each description step as a list item', () => {
    render(<ChoresInfo choreInfo={baseChore} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders the text content of each step', () => {
    render(<ChoresInfo choreInfo={baseChore} />);
    expect(screen.getByText(/Rinse the plates/)).toBeInTheDocument();
    expect(screen.getByText(/Scrub with soap/)).toBeInTheDocument();
    expect(screen.getByText(/Dry with a towel/)).toBeInTheDocument();
  });

  it('filters out numeric-only segments between periods', () => {
    render(<ChoresInfo choreInfo={{ name: 'Test', description: 'Step one.1.Step two' }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders no list items when description is empty', () => {
    render(<ChoresInfo choreInfo={{ name: 'Test', description: '' }} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders a single step when description has no periods', () => {
    render(<ChoresInfo choreInfo={{ name: 'Test', description: 'Just do it' }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText(/Just do it/)).toBeInTheDocument();
  });
});
