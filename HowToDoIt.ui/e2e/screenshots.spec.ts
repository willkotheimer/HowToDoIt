import { test } from '@playwright/test';
import path from 'path';

// Capture fresh product screenshots that reflect the CURRENT look:
//   - the 5 "How it works" walkthrough frames wired into the feed
//   - the two README hero shots
// The dev SPA is served locally (so it uses the latest SCSS) but points at the
// live, seeded prod API for data. No writes are performed, so it is safe to run
// against production. The 16:10 viewport matches the feed's .slide__frame ratio.
//
//   VITE_API_BASE_URL=<prod>/api npx vite --port 3000        (server)
//   PLAYWRIGHT_API_BASE=<prod>/api npx playwright test screenshots
//
// Output: e2e/walkthrough-shots/*.png

const OUT = path.join(__dirname, 'walkthrough-shots');
const API = process.env.PLAYWRIGHT_API_BASE || 'https://howtodoit-api.azurewebsites.net/api';
const SAMPLES = [
  path.join(__dirname, '..', 'public', 'seed', '101-1.jpg'),
  path.join(__dirname, '..', 'public', 'seed', '101-2.jpg'),
  path.join(__dirname, '..', 'public', 'seed', '101-3.jpg'),
];

test('capture current-look screenshots', async ({ page, request }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 800 });

  // ── Step 1: Sign in — signed-out create page shows the "sign in to unlock"
  //    gate + the Sign In control in the nav. (Avoids a recursive shot of the
  //    feed, which is itself where this walkthrough lives.) ──
  await page.goto('/create');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'howto-1-signin.png') });

  // Enable the dev-only writer bypass for the remaining (editor) shots.
  await page.addInitScript(() => window.localStorage.setItem('e2e-writer', '1'));

  // ── Step 2: Create a domain & category (fill only — no POST to prod) ──
  await page.goto('/create');
  await page.getByPlaceholder('e.g. Change the die on Press #4').fill('Change the Air Filter');
  await page.getByPlaceholder('e.g. Coffee Shop, Retail Store, Bike Shop').fill('Facilities');
  await page.getByPlaceholder('Add a new category').fill('Maintenance');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'howto-2-create.png') });

  // Open a seeded sequence in edit mode for the image-related shots. The list
  // endpoint does not populate steps, so probe details; prefer a well-known
  // seeded sequence, else the first whose steps actually have images (skips any
  // empty scratch sequences left in the DB).
  const seqs = await (await request.get(`${API}/WorkSequences`)).json();
  let target: any = null;
  for (const s of seqs) {
    const detail = await (await request.get(`${API}/WorkSequences/${s.id}`)).json();
    const steps = detail.steps ?? [];
    const hasImages = steps.some((st: any) => (st.images?.length ?? 0) > 0);
    if (steps.length > 0 && hasImages) {
      if (detail.title === 'Store Opening') { target = detail; break; }
      if (!target) target = detail;
    }
  }
  await page.goto(`/sequence/${target.id}/edit`);
  await page.waitForSelector('.step-editor', { timeout: 20000 });

  // ── Step 3: Upload your images (previews render client-side in the modal) ──
  await page.getByRole('button', { name: 'Add Images' }).first().click();
  await page.locator('input[type="file"]').first().setInputFiles(SAMPLES);
  await page.waitForTimeout(700);
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
  await desc.fill('Write a short, plain-language caption so anyone can follow this step exactly.');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'howto-5-describe.png') });

  // ── README hero shots ──
  await page.goto('/');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(OUT, 'readme-splash.png') });
  await page.goto(`/sequence/${target.id}`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'readme-detail.png'), fullPage: true });
});
