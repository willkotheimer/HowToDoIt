import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChoresImages from '../ChoresImages';

const baseProps = {
  deleteImage: undefined,
  onUpdate: vi.fn(),
  showButtons: false,
  toggleRight: vi.fn(),
  toggleLeft: vi.fn(),
};

describe('ChoresImages', () => {
  it('renders an image for each item in choreImages', () => {
    const images = [
      { id: 1, image: 'https://example.com/a.jpg' },
      { id: 2, image: 'https://example.com/b.jpg' },
      { id: 3, image: 'https://example.com/c.jpg' },
    ];
    render(<ChoresImages {...baseProps} choreImages={images} />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('renders correct src for each image', () => {
    const images = [
      { id: 1, image: 'https://example.com/first.jpg' },
      { id: 2, image: 'https://example.com/second.jpg' },
    ];
    render(<ChoresImages {...baseProps} choreImages={images} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/first.jpg');
    expect(imgs[1]).toHaveAttribute('src', 'https://example.com/second.jpg');
  });

  it('renders 1-indexed ordinals for each image', () => {
    const images = [
      { id: 1, image: 'https://example.com/a.jpg' },
      { id: 2, image: 'https://example.com/b.jpg' },
    ];
    render(<ChoresImages {...baseProps} choreImages={images} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders an empty container when choreImages is empty', () => {
    const { container } = render(<ChoresImages {...baseProps} choreImages={[]} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(container.querySelector('.d-flex')).toBeInTheDocument();
  });
});
