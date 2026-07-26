import { test as base, expect, Page } from '@playwright/test';

type AppFixtures = {
  /**
   * A page in sandbox mode (unauthenticated, localStorage cleared).
   * Use this for any test that doesn't need a real login.
   * Extend this file with an `authedPage` fixture when auth tests are added.
   */
  sandboxPage: Page;
};

export const test = base.extend<AppFixtures>({
  sandboxPage: async ({ page }, use) => {
    // Clear any leftover sandbox data so tests start from a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Wait for the React app shell to be ready
    await expect(page.locator('#root')).not.toBeEmpty();
    await use(page);
  },
});

export { expect } from '@playwright/test';
