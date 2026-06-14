import { test, expect } from '../fixtures';

test.describe('Smoke: route loading', () => {

  test('landing page renders', async ({ sandboxPage: page }) => {
    await page.goto('/');
    // The Play Book landing page has the hero section and photo strip
    await expect(page.locator('.tpb-hero')).toBeVisible();
    await expect(page.locator('.tpb-strip')).toBeVisible();
  });

  test('dashboard renders in sandbox mode', async ({ sandboxPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'THE PLAY BOOK', exact: true })).toBeVisible();
    // Sandbox banner confirms unauthenticated state
    await expect(page.getByText(/sandbox mode/i)).toBeVisible();
  });

  test('dashboard shows assign-chores panel', async ({ sandboxPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Assign the Chores')).toBeVisible();
  });

  test('assignment board renders', async ({ sandboxPage: page }) => {
    await page.goto('/assignmentBoard');
    await expect(page.getByRole('heading', { name: 'Household Chores', exact: true })).toBeVisible();
  });

  test('chore details page renders', async ({ sandboxPage: page }) => {
    await page.goto('/chore/1');
    await expect(page.getByText(/Chore Details/)).toBeVisible();
  });

  test('nav is present on every route', async ({ sandboxPage: page }) => {
    const routes = ['/', '/dashboard', '/assignmentBoard'];
    for (const route of routes) {
      await page.goto(route);
      // Brand logo link — scoped to banner to avoid matching the footer copyright link
      await expect(page.getByRole('banner').getByRole('link', { name: 'The Play Book', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Assignment Board', exact: true })).toBeVisible();
    }
  });

  test('sign-in button is visible when logged out', async ({ sandboxPage: page }) => {
    await page.goto('/');
    // Auth component renders a "Sign In" button in the nav when no user is logged in
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

});
