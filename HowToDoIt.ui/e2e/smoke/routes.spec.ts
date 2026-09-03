import { test, expect } from '../fixtures';

/**
 * Smoke tests for HowToDoIt's four real routes.
 *
 * These replace a suite inherited from the Household codebase that tested routes
 * this application does not have (/dashboard, /assignmentBoard, /playbook,
 * /chore/1) and failed 6 of 7 (F-0011), which failed the FrontendCI stage and so
 * blocked DeployFrontend from ever running.
 *
 * Governance-Ref: F-0011
 *
 * CONSTRAINT: the pipeline serves the static build with NO API behind it, so every
 * assertion here must hold without one. That rules out asserting on sequence data
 * and makes the app shell, the unauthenticated denial, and the not-found path the
 * things worth smoke-testing.
 */

// The API is absent in CI and react-query retries before surfacing an error, so
// data-dependent states need more room than the 5s default.
const SETTLE = 20_000;

test.describe('Smoke: route loading', () => {
  test('app shell renders on the landing page', async ({ sandboxPage: page }) => {
    await page.goto('/');
    await expect(page.locator('.brand-text')).toHaveText('HowToDoIt');
  });

  test('landing page renders the browse splash', async ({ sandboxPage: page }) => {
    await page.goto('/');
    const splashNav = page.getByRole('navigation', { name: 'Sections' });
    await expect(splashNav).toBeVisible();
    await expect(splashNav.getByText('Browse')).toBeVisible();
    await expect(splashNav.getByText('Overview')).toBeVisible();
    // The hero renders from static walkthrough frames, so it must appear even
    // with no sequences loaded.
    await expect(page.locator('.hero-narr h1').first()).toBeVisible();
  });

  test('editor route denies an unauthenticated visitor', async ({ sandboxPage: page }) => {
    // Negative assertion (SGS 4.3): an unauthorised route must return an explicit
    // denial, not an empty page or a silently rendered editor.
    await page.goto('/create');
    await expect(page.locator('.editor__denied')).toBeVisible({ timeout: SETTLE });
    await expect(page.locator('.editor__denied')).toHaveText(/do not have permission/i);
  });

  test('editor route exposes no sequence form to an unauthenticated visitor', async ({ sandboxPage: page }) => {
    // Negative assertion (SGS 4.3): assert the ABSENCE of the writer-only controls,
    // not merely the presence of the denial message.
    await page.goto('/create');
    await expect(page.locator('.editor__denied')).toBeVisible({ timeout: SETTLE });
    await expect(page.getByRole('heading', { name: /new sequence/i })).toHaveCount(0);
    await expect(page.getByPlaceholder('e.g. Change the die on Press #4')).toHaveCount(0);
  });

  test('unknown sequence renders a not-found message rather than crashing', async ({ sandboxPage: page }) => {
    await page.goto('/sequence/99999999');
    await expect(page.getByText(/sequence not found/i)).toBeVisible({ timeout: SETTLE });
    // The shell must survive the failed load.
    await expect(page.locator('.brand-text')).toHaveText('HowToDoIt');
  });

  test('sign-in button is visible when logged out', async ({ sandboxPage: page }) => {
    await page.goto('/');
    // Auth component renders a "Sign In" button in the nav when no user is logged in
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('create link is hidden from the nav when logged out', async ({ sandboxPage: page }) => {
    // Negative assertion (SGS 4.3): the writer-only nav entry must be absent, not
    // merely non-functional.
    await page.goto('/');
    await expect(page.locator('.navbar-item[href="/create"]')).toHaveCount(0);
  });
});
