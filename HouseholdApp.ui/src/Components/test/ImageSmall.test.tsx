import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Image from '../ImageSmall';

const baseProps = {
  image: 'https://example.com/photo.jpg',
  imageId: 7,
  imageOrdinal: 0,
  onUpdate: vi.fn(),
  showButtons: false,
  toggleRight: vi.fn(),
  toggleLeft: vi.fn(),
};

describe('ImageSmall', () => {
  it('renders the image with the correct src', () => {
    render(<Image {...baseProps} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders a 1-indexed ordinal number when imageOrdinal is 0', () => {
    render(<Image {...baseProps} imageOrdinal={0} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders the correct ordinal for higher indexes', () => {
    render(<Image {...baseProps} imageOrdinal={4} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render an ordinal when imageOrdinal is negative', () => {
    render(<Image {...baseProps} imageOrdinal={-1} />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('renders reorder buttons when showButtons is true', () => {
    render(<Image {...baseProps} showButtons={true} />);
    expect(screen.getByText(/left/i)).toBeInTheDocument();
    expect(screen.getByText(/right/i)).toBeInTheDocument();
  });

  it('does not render reorder buttons when showButtons is false', () => {
    render(<Image {...baseProps} showButtons={false} />);
    expect(screen.queryByText(/left/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/right/i)).not.toBeInTheDocument();
  });

  it('calls toggleLeft with the imageId when the left button is clicked', () => {
    const toggleLeft = vi.fn();
    render(<Image {...baseProps} showButtons={true} toggleLeft={toggleLeft} />);
    fireEvent.click(screen.getByText(/left/i));
    expect(toggleLeft).toHaveBeenCalledWith(7);
  });

  it('calls toggleRight with the imageId when the right button is clicked', () => {
    const toggleRight = vi.fn();
    render(<Image {...baseProps} showButtons={true} toggleRight={toggleRight} />);
    fireEvent.click(screen.getByText(/right/i));
    expect(toggleRight).toHaveBeenCalledWith(7);
  });
});
