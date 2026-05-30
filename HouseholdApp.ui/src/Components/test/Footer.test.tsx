import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the HOUSEHOLD brand heading', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: 'HOUSEHOLD' })).toBeInTheDocument();
  });

  it('renders the copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/2024 Copyright/)).toBeInTheDocument();
  });

  it('renders the copyright link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /HOUSEHOLD/i })).toBeInTheDocument();
  });

  it('renders the "WHAT IS HOUSEHOLD?" section heading', () => {
    render(<Footer />);
    expect(screen.getByText('WHAT IS HOUSEHOLD?')).toBeInTheDocument();
  });

  it('renders the "Remove the guesswork" section heading', () => {
    render(<Footer />);
    expect(screen.getByText('Remove the guesswork')).toBeInTheDocument();
  });

  it('renders the footer logo image', () => {
    render(<Footer />);
    expect(document.querySelector('.footerLogo')).toBeInTheDocument();
  });
});
