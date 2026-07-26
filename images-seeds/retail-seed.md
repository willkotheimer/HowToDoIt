# Retail Clothing Clerk — seed sequences (from seed-mockup2.png)

Second seed set, numbered 201–203 (continues the coffee-shop 101–103 set).
Image filenames follow `NNN-S.png` (sequence-step) → compressed to `.jpg` in
`HowToDoIt.ui/public/seed/`. Wire into `DbSeeder.cs` once the images exist.

---

## 201 — Folding Shirts  (category: Presentation)
Intro: "Fold a knit shirt to a clean, square retail fold — consistent every time."

1. **Prone alignment & smoothing** — Lay the shirt face-down on the table and smooth out every wrinkle before folding. → `201-1`
2. **Lateral shoulder fold** — Fold each sleeve and side seam inward toward the vertical center line. → `201-2`
3. **Hem-to-collar base fold** — Fold the bottom hem up by one-third toward the neckline. → `201-3`
4. **Final shoulder tuck & inversion** — Complete the fold, tuck the shoulders, and invert to a clean rectangle. → `201-4`
5. **Table placement & spacing** — Set the folded shirt on the display table, squared and evenly spaced in the stack. → `201-5`

## 202 — Floor Inventory Audit  (category: Inventory)
Intro: "Audit a floor rack accurately: partition, count, scan, and reconcile."

1. **Zone partitioning** — Divide the rack into sections with dividers (e.g., small/medium knits on one side). → `202-1`
2. **Physical tally count** — Count each garment by hand, checking size-marker tags as you go. → `202-2`
3. **SKU & barcode scanning** — Scan each internal care-label barcode with the handheld scanner. → `202-3`
4. **Discrepancy flagging** — Enter the counts into the device and flag any missing units in an error report. → `202-4`
5. **Restocking & front-facing** — Restock gaps and front-face the folded stacks so sizes read cleanly. → `202-5`

## 203 — Customer Checkout  (category: Point of Sale)
Intro: "Ring up a customer end to end: inspect, scan, apply loyalty, take payment, and bag."

1. **Garment unfolding & tag inspection** — Unfold each item at the counter to inspect for hidden security sensors. → `203-1`
2. **POS barcode scanning** — Pass each garment's barcode across the scanner until it beeps. → `203-2`
3. **Loyalty & promotion application** — Ask the customer about loyalty membership and apply any promotions. → `203-3`
4. **Payment processing** — Take payment on the Stripe card reader and wait for approval. → `203-4`
5. **Receipt issuance & bagging** — Issue the receipt and bag the folded items neatly. → `203-5`
