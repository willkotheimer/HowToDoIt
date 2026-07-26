import { test } from '@playwright/test';
import path from 'path';

// Captures the "How it works" walkthrough screenshots against a local instance.
// These double as (a) step images for the onboarding sequence, (b) README shots,
// and (c) a reusable smoke path for the pipeline.
//
// Run with the local API up (https://localhost:5001) and seeded:
//   npx playwright test walkthrough --headed  (or headless)
// Output: e2e/walkthrough-shots/*.png

const OUT = path.join(__dirname, 'walkthrough-shots');
const API = process.env.PLAYWRIGHT_API_BASE || 'https://localhost:5001/api';
const SAMPLES = [
  path.join(__dirname, '..', 'public', 'seed', '103-1.jpg'),
  path.join(__dirname, '..', 'public', 'seed', '103-2.jpg'),
  path.join(__dirname, '..', 'public', 'seed', '103-3.jpg'),
];

test('capture How-it-works walkthrough', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 860 });

  // ── Step 1: Sign in (signed-out state, before the writer bypass) ──
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'howto-1-signin.png') });

  // Enable the dev-only writer bypass for the remaining (editor) shots.
  await page.addInitScript(() => window.localStorage.setItem('e2e-writer', '1'));

  // ── Step 2: Create a domain & category ──
  await page.goto('/create');
  await page.getByPlaceholder('e.g. Change the die on Press #4').fill('Change the Air Filter');
  await page.getByPlaceholder('e.g. Coffee Shop, Retail Store, Bike Shop').fill('Facilities');
  await page.getByPlaceholder('Add a new category').fill('Maintenance');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'howto-2-create.png') });

  // Open a seeded sequence in edit mode for the image-related shots.
  const res = await request.get(`${API}/WorkSequences`);
  const seqs = await res.json();
  const target = seqs.find((s: any) => s.title === 'Store Opening') ?? seqs[0];
  await page.goto(`/sequence/${target.id}/edit`);
  await page.waitForSelector('.step-editor', { timeout: 20000 });

  // ── Step 3: Upload your images (previews render client-side) ──
  await page.getByRole('button', { name: 'Add Images' }).first().click();
  await page.locator('input[type="file"]').first().setInputFiles(SAMPLES);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'howto-3-upload.png') });
  await page.getByRole('button', { name: 'Cancel' }).click();

  // ── Step 4: Order your photos (reorder controls on the step's images) ──
  const firstImages = page.locator('.step-editor__images').first();
  await firstImages.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'howto-4-order.png') });

  // ── Step 5: Add descriptions ──
  const desc = page.locator('.step-editor textarea').first();
  await desc.scrollIntoViewIfNeeded();
  await desc.click();
  await desc.fill('Cycle the ram to bottom-dead-center and apply your personal lock and tag before entering the die area.');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'howto-5-describe.png') });

  // ── Bonus: clean splash + detail shots for the README ──
  await page.goto('/');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, 'readme-splash.png') });
  await page.goto(`/sequence/${target.id}`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'readme-detail.png'), fullPage: true });
});
