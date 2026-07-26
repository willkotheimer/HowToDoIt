# Online Store — seed sequences (domain #3, replaces the scrapped Bike Shop)

Numbered 401–403. Domain: **Online Store**. Image filenames follow `NNN-S.png`
(sequence-step) → compressed to `.jpg` in `HowToDoIt.ui/public/seed/`. Wire into
`DbSeeder.cs` once the images exist.

---

## 401 — Pack & Ship an Order  (category: Fulfillment)
Intro: "Fulfill an order accurately and get it out the door."

1. **Pull the item** — Pick the ordered item from the shelf using the pick list. → `401-1`
2. **Verify against the packing slip** — Check the item, SKU, and quantity against the packing slip. → `401-2`
3. **Protect & box it** — Wrap the item, cushion it, and seal it in a right-sized box. → `401-3`
4. **Print & apply the label** — Print the shipping label and stick it squarely on the box. → `401-4`
5. **Hand off to the carrier** — Log the tracking number and set the parcel out for pickup. → `401-5`

## 402 — List a New Product  (category: Listings)
Intro: "Turn a new product into a clean, findable listing."

1. **Photograph the product** — Shoot the product on a clean background from a few angles. → `402-1`
2. **Weigh & measure** — Weigh the item and note its dimensions for shipping. → `402-2`
3. **Write the listing** — Draft a clear title and description with the key details. → `402-3`
4. **Set price & inventory** — Set the price and enter the on-hand quantity. → `402-4`
5. **Publish** — Review and publish the listing to the store. → `402-5`

## 403 — Process a Return  (category: Returns)
Intro: "Handle a return cleanly and close the loop with the customer."

1. **Receive the package** — Match the returned parcel to its return request (RMA). → `403-1`
2. **Inspect the item** — Check the item's condition against the return reason. → `403-2`
3. **Restock or discard** — Return sellable items to stock; set damaged ones aside. → `403-3`
4. **Issue the refund** — Refund the customer for the approved amount. → `403-4`
5. **Close the ticket** — Note the outcome and close the return ticket. → `403-5`
