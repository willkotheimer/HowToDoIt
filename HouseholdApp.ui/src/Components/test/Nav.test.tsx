import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../Auth', () => ({ default: () => <div data-testid="auth-mock" /> }));

import Nav from '../Nav';

describe('Nav', () => {
  const renderNav = () =>
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>,
    );

  it('renders the Household brand link', () => {
    renderNav();
    expect(screen.getAllByText('Household').length).toBeGreaterThan(0);
  });

  it('renders the AssignmentBoard navigation link', () => {
    renderNav();
    expect(screen.getByText('AssignmentBoard')).toBeInTheDocument();
  });

  it('renders the Auth component', () => {
    renderNav();
    expect(screen.getByTestId('auth-mock')).toBeInTheDocument();
  });

  it('AssignmentBoard link points to /assignmentBoard', () => {
    renderNav();
    const link = screen.getByText('AssignmentBoard').closest('a');
    expect(link).toHaveAttribute('href', '/assignmentBoard');
  });
});
