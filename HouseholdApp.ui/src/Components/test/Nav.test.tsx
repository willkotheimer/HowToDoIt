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

  it('renders the brand logo image', () => {
    renderNav();
    expect(document.querySelector('.brand img')).toBeInTheDocument();
  });

  it('renders the Assignment Board navigation link', () => {
    renderNav();
    expect(screen.getByText('Assignment Board')).toBeInTheDocument();
  });

  it('renders the Auth component', () => {
    renderNav();
    expect(screen.getByTestId('auth-mock')).toBeInTheDocument();
  });

  it('Assignment Board link points to /assignmentBoard', () => {
    renderNav();
    const link = screen.getByText('Assignment Board').closest('a');
    expect(link).toHaveAttribute('href', '/assignmentBoard');
  });
});
