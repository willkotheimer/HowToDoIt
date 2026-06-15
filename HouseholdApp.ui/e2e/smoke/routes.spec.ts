import { test, expect } from '../fixtures';

test.describe('Smoke: route loading', () => {

  test('landing page renders', async ({ sandboxPage: page }) => {
    await page.goto('/');
    await expect(page.locator('.tpb-hero')).toBeVisible();
    await expect(page.locator('.tpb-strip')).toBeVisible();
  });

  test('dashboard renders with stats', async ({ sandboxPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'THE PLAY BOOK', exact: true })).toBeVisible();
    // Sandbox banner confirms unauthenticated state
    await expect(page.getByText(/sandbox mode/i)).toBeVisible();
    // Verify dashboard stats are visible
    await expect(page.getByText('REMAINING TASKS')).toBeVisible();
    await expect(page.getByText('YOUR HOUSEHOLD')).toBeVisible();
  });

  test('task board renders with task grid', async ({ sandboxPage: page }) => {
    await page.goto('/assignmentBoard');
    await expect(page.getByRole('heading', { name: 'Task Board', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
  });

  test('my playbook renders with week info', async ({ sandboxPage: page }) => {
    await page.goto('/playbook');
    await expect(page.getByRole('heading', { name: 'My Playbook', exact: true })).toBeVisible();
    await expect(page.getByText(/week/i)).toBeVisible();
  });

  test('profiles / command center renders', async ({ sandboxPage: page }) => {
    await page.goto('/profiles');
    await expect(page.getByRole('heading', { name: 'Playbook Command Center', exact: true })).toBeVisible();
    await expect(page.getByText(/batch task-to-profile/i)).toBeVisible();
  });

  test('household settings renders', async ({ sandboxPage: page }) => {
    await page.goto('/settings');
    // Settings page should have form controls for rollover and max chores
    await expect(page.getByText(/rollover/i)).toBeVisible();
  });

  test('chore details page renders', async ({ sandboxPage: page }) => {
    await page.goto('/chore/1');
    await expect(page.getByText(/Chore Details/)).toBeVisible();
  });

  test('nav is present and has expected links', async ({ sandboxPage: page }) => {
    const routes = ['/', '/dashboard', '/assignmentBoard', '/playbook'];
    for (const route of routes) {
      await page.goto(route);
      // Brand logo link — scoped to banner to avoid matching the footer copyright link
      await expect(page.getByRole('banner').getByRole('link', { name: 'The Play Book', exact: true })).toBeVisible();
      // Task Board link (renamed from Assignment Board)
      await expect(page.getByRole('banner').getByRole('link', { name: 'Task Board', exact: true })).toBeVisible();
      // Profiles and Settings links
      await expect(page.getByRole('banner').getByRole('link', { name: 'Profiles', exact: true })).toBeVisible();
      await expect(page.getByRole('banner').getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
    }
  });

  test('sign-in button is visible when logged out', async ({ sandboxPage: page }) => {
    await page.goto('/');
    // Auth component renders a "Sign In" button in the nav when no user is logged in
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

});
