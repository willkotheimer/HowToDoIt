import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CustomizedAccordions from '../Accordion';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ authed: true, user: null, uid: '', userHousehold: [], householdId: 0 }),
}));

const completeTask = vi.fn();

const incompleteAssignment = {
  choreId: 1,
  chorename: 'Wash Dishes',
  categoryName: 'Kitchen',
  choreDescription: 'Scrub all the dishes thoroughly',
  isCompleted: false,
  userId: 10,
  firstname: 'Alice',
  week: 5,
  rating: 0,
};

const completedAssignment = {
  ...incompleteAssignment,
  choreId: 2,
  chorename: 'Vacuuming',
  isCompleted: true,
};

const images = [{ choreId: 1, image: 'https://example.com/dishes.jpg' }];

const renderAccordion = (assignments: object[], imgs = images) =>
  render(
    <MemoryRouter>
      <CustomizedAccordions
        userAssignments={assignments}
        images={imgs}
        completeTask={completeTask}
      />
    </MemoryRouter>,
  );

describe('Accordion', () => {
  it('renders a card for each assignment', () => {
    renderAccordion([incompleteAssignment, completedAssignment]);
    expect(document.querySelectorAll('.card')).toHaveLength(2);
    expect(document.querySelectorAll('.card-header')).toHaveLength(2);
  });

  it('renders the chore name in the header for each assignment', () => {
    renderAccordion([incompleteAssignment, completedAssignment]);
    // Names are in card headers which are always in the DOM
    const headers = document.querySelectorAll('.card-header');
    expect(headers[0].textContent).toMatch(/Wash Dishes/);
    expect(headers[1].textContent).toMatch(/Vacuuming/);
  });

  it('renders the category name in the header', () => {
    renderAccordion([incompleteAssignment]);
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('renders the first name of the assigned person in the header', () => {
    renderAccordion([incompleteAssignment]);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('panels start closed — body content is not visible before clicking', () => {
    renderAccordion([incompleteAssignment]);
    expect(screen.queryByText('Complete Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });

  it('clicking a header opens that panel', () => {
    renderAccordion([incompleteAssignment]);
    fireEvent.click(document.querySelector('.card-header')!);
    expect(screen.getByText('Complete Task')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('does not render "Complete Task" for a completed assignment when open', () => {
    renderAccordion([completedAssignment]);
    fireEvent.click(document.querySelector('.card-header')!);
    expect(screen.queryByText('Complete Task')).not.toBeInTheDocument();
  });

  it('calls completeTask with the assignment when the button is clicked', () => {
    completeTask.mockClear();
    renderAccordion([incompleteAssignment]);
    fireEvent.click(document.querySelector('.card-header')!);
    fireEvent.click(screen.getByText('Complete Task'));
    expect(completeTask).toHaveBeenCalledTimes(1);
    expect(completeTask).toHaveBeenCalledWith(expect.objectContaining({ choreId: 1 }));
  });

  it('opening a second panel closes the first', () => {
    renderAccordion([incompleteAssignment, completedAssignment]);
    const headers = document.querySelectorAll('.card-header');
    fireEvent.click(headers[0]); // open panel 0
    expect(screen.getByText('Complete Task')).toBeInTheDocument();
    fireEvent.click(headers[1]); // open panel 1 — panel 0 should close
    expect(screen.queryByText('Complete Task')).not.toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('clicking an open header closes that panel', () => {
    renderAccordion([incompleteAssignment]);
    const header = document.querySelector('.card-header')!;
    fireEvent.click(header); // open
    expect(screen.getByText('Complete Task')).toBeInTheDocument();
    fireEvent.click(header); // close again
    expect(screen.queryByText('Complete Task')).not.toBeInTheDocument();
  });

  it('renders an empty container when no assignments are passed', () => {
    const { container } = renderAccordion([]);
    expect(document.querySelectorAll('.card')).toHaveLength(0);
    expect(container.firstChild).toBeInTheDocument();
  });
});
