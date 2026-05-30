import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppModal from '../AppModal';

const Child = () => <div>Child content</div>;

describe('AppModal', () => {
  const defaultProps = {
    buttonLabel: 'Open',
    title: 'Test Modal',
    btnColor: 'primary',
    className: '',
    deletePosition: '',
  };

  it('renders the trigger button with the given label', () => {
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('does not show modal content before the button is clicked', () => {
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    expect(screen.queryByText('Child content')).not.toBeInTheDocument();
  });

  it('shows modal content after the trigger button is clicked', () => {
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows the modal title after opening', () => {
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('shows a Cancel button inside the open modal', () => {
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('closes the modal when Cancel is clicked', async () => {
    vi.useFakeTimers();
    render(<AppModal {...defaultProps}><Child /></AppModal>);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Child content')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    // advance past Reactstrap's fade-out transition (150ms default)
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText('Child content')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
