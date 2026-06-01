import { test, expect } from '../fixtures';

test.describe('Smoke: route loading', () => {

  test('splash page renders', async ({ sandboxPage: page }) => {
    await page.goto('/splash');
    // Splash renders the badge login button and the image strip
    await expect(page.locator('.splash')).toBeVisible();
    await expect(page.locator('.splashStrip')).toBeVisible();
  });

  test('dashboard renders in sandbox mode', async ({ sandboxPage: page }) => {
    await page.goto('/');
    await expect(page.getByText('HOUSEHOLD')).toBeVisible();
    // Sandbox banner confirms unauthenticated state
    await expect(page.getByText(/sandbox mode/i)).toBeVisible();
  });

  test('dashboard shows assign-chores panel', async ({ sandboxPage: page }) => {
    await page.goto('/');
    await expect(page.getByText('Assign the Chores')).toBeVisible();
  });

  test('assignment board renders', async ({ sandboxPage: page }) => {
    await page.goto('/assignmentBoard');
    await expect(page.getByText('Household Chores')).toBeVisible();
  });

  test('chore details page renders', async ({ sandboxPage: page }) => {
    await page.goto('/chore/1');
    await expect(page.getByText(/Chore Details/)).toBeVisible();
  });

  test('nav is present on every route', async ({ sandboxPage: page }) => {
    const routes = ['/', '/splash', '/assignmentBoard'];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: 'Household' })).toBeVisible();
      await expect(page.getByRole('link', { name: /AssignmentBoard/i })).toBeVisible();
    }
  });

  test('sign-in button is visible when logged out', async ({ sandboxPage: page }) => {
    await page.goto('/splash');
    // Auth component renders the Sign In badge button on splash
    await expect(page.locator('.splashHero .button')).toBeVisible();
  });

});
