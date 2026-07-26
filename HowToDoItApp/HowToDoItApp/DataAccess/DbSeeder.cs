using System;
using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HowToDoItApp.DataAccess
{
    /// <summary>
    /// Applies pending migrations and seeds the example work sequences (coffee-shop
    /// SOPs 101-103, retail-clerk SOPs 201-203, and online-store SOPs 401-403).
    /// Image URLs are relative
    /// "/seed/*.jpg" paths served by the frontend's public/ folder, so the demo
    /// works locally without blob storage. Idempotent per title: only inserts
    /// sequences that don't already exist, so it can add new sets without wiping.
    /// </summary>
    public static class DbSeeder
    {
        public static void Seed(HowToDoItContext context)
        {
            context.Database.Migrate();

            // Get-or-create a category by name so sets can share/reuse categories.
            Category Cat(string name)
            {
                var existing = context.Categories.FirstOrDefault(c => c.CategoryName == name);
                if (existing != null) return existing;
                var created = new Category { CategoryName = name };
                context.Categories.Add(created);
                context.SaveChanges();
                return created;
            }

            var now = DateTime.UtcNow;

            WorkStep Step(string code, int n, string title, string desc) => new WorkStep
            {
                Title = title,
                Description = desc,
                SortOrder = n - 1,
                Images = new List<StepImage>
                {
                    new StepImage { ImageUrl = $"/seed/{code}-{n}.jpg", SortOrder = 0, Active = 1 },
                },
            };

            WorkSequence Seq(string title, string domain, Category category, string intro, List<WorkStep> steps) => new WorkSequence
            {
                Title = title, Domain = domain, Category = category, IsPublic = true, CreatedAt = now, UpdatedAt = now,
                Description = intro, Steps = steps,
            };

            var all = new List<WorkSequence>
            {
                // ── Coffee Shop Baker (101-103) ──────────────────────────────────
                Seq("Store Opening", "Coffee Shop", Cat("Operations"),
                    "Standard Operating Procedure 101. Open the café: systems on, environment set, and surfaces sanitized before the first customer.",
                    new List<WorkStep>
                    {
                        Step("101", 1, "Disarm & unlock the door", "Key the alarm code into the entry panel and flip the door sign to OPEN."),
                        Step("101", 2, "Set the HVAC", "Turn the wall thermostat / exhaust control to the daytime target."),
                        Step("101", 3, "Power the line", "Flip the main breaker to bring the espresso machine and equipment online."),
                        Step("101", 4, "Prep the service station", "Stock cups, tools, and the register so the bar is ready to run."),
                        Step("101", 5, "Sanitize the counter", "Wipe down the front counter with sanitizer solution and a fresh microfiber cloth."),
                    }),
                Seq("Pastry Merchandising", "Coffee Shop", Cat("Merchandising"),
                    "Standard Operating Procedure 102. Stage the pastry case so it looks full, fresh, and clearly presented.",
                    new List<WorkStep>
                    {
                        Step("102", 1, "Check the case temperature", "Confirm the refrigerated display case is holding safe temperature on the gauge."),
                        Step("102", 2, "Load the tray", "Bring out the day's assorted pastries on a clean bakery tray."),
                        Step("102", 3, "Stage the riser", "Arrange items on the acrylic riser so every piece is visible from the front."),
                        Step("102", 4, "Balance color and spacing", "Place contrasting items together with even spacing for a full, tidy look."),
                    }),
                Seq("Morning Brew", "Coffee Shop", Cat("Beverage"),
                    "Standard Operating Procedure 103. Pull a calibrated 18 g espresso shot — repeatable every time.",
                    new List<WorkStep>
                    {
                        Step("103", 1, "Grind fresh to spec", "Dose 18 g of freshly ground espresso into the portafilter."),
                        Step("103", 2, "Weigh the dose", "Set the portafilter on the scale and confirm the target dose."),
                        Step("103", 3, "Tamp level and firm", "Tamp the grounds flat and level with steady downward force."),
                        Step("103", 4, "Flush the group head", "Run a short flush to purge and stabilize temperature before locking in."),
                        Step("103", 5, "Pull and serve", "Lock in, start the timer, and brew into the cup to the target yield."),
                    }),

                // ── Retail Clothing Clerk (201-203) ──────────────────────────────
                Seq("Folding Shirts", "Retail Store", Cat("Presentation"),
                    "Fold a knit shirt to a clean, square retail fold — consistent every time.",
                    new List<WorkStep>
                    {
                        Step("201", 1, "Prone alignment & smoothing", "Lay the shirt face-down on the table and smooth out every wrinkle before folding."),
                        Step("201", 2, "Lateral shoulder fold", "Fold each sleeve and side seam inward toward the vertical center line."),
                        Step("201", 3, "Hem-to-collar base fold", "Fold the bottom hem up by one-third toward the neckline."),
                        Step("201", 4, "Final shoulder tuck & inversion", "Complete the fold, tuck the shoulders, and invert to a clean rectangle."),
                        Step("201", 5, "Table placement & spacing", "Set the folded shirt on the display table, squared and evenly spaced in the stack."),
                    }),
                Seq("Floor Inventory Audit", "Retail Store", Cat("Inventory"),
                    "Audit a floor rack accurately: partition, count, scan, reconcile, and restock.",
                    new List<WorkStep>
                    {
                        Step("202", 1, "Zone partitioning", "Divide the rack into sections with dividers (e.g., small/medium on one side)."),
                        Step("202", 2, "Physical tally count", "Count each garment by hand, checking size-marker tags as you go."),
                        Step("202", 3, "SKU & barcode scanning", "Scan each internal care-label barcode with the handheld scanner."),
                        Step("202", 4, "Discrepancy flagging", "Enter the counts into the device and flag any missing units in an error report."),
                        Step("202", 5, "Restocking & front-facing", "Restock gaps and front-face the folded stacks so sizes read cleanly."),
                    }),
                Seq("Customer Checkout", "Retail Store", Cat("Point of Sale"),
                    "Ring up a customer end to end: inspect, scan, apply loyalty, take payment, and bag.",
                    new List<WorkStep>
                    {
                        Step("203", 1, "Garment unfolding & tag inspection", "Unfold each item at the counter to inspect for hidden security sensors."),
                        Step("203", 2, "POS barcode scanning", "Pass each garment's barcode across the scanner until it beeps."),
                        Step("203", 3, "Loyalty & promotion application", "Ask the customer about loyalty membership and apply any promotions."),
                        Step("203", 4, "Payment processing", "Take payment on the Stripe card reader and wait for approval."),
                        Step("203", 5, "Receipt issuance & bagging", "Issue the receipt and bag the folded items neatly."),
                    }),

                // ── Online Store Fulfillment (401-403) ───────────────────────────
                Seq("Pack & Ship an Order", "Online Store", Cat("Fulfillment"),
                    "Fulfill an order accurately and get it out the door.",
                    new List<WorkStep>
                    {
                        Step("401", 1, "Pull the item", "Pick the ordered item from the shelf using the pick list."),
                        Step("401", 2, "Verify against the packing slip", "Check the item, SKU, and quantity against the packing slip."),
                        Step("401", 3, "Protect & box it", "Wrap the item, cushion it, and seal it in a right-sized box."),
                        Step("401", 4, "Print & apply the label", "Print the shipping label and stick it squarely on the box."),
                        Step("401", 5, "Hand off to the carrier", "Log the tracking number and set the parcel out for pickup."),
                    }),
                Seq("List a New Product", "Online Store", Cat("Listings"),
                    "Turn a new product into a clean, findable listing.",
                    new List<WorkStep>
                    {
                        Step("402", 1, "Photograph the product", "Shoot the product on a clean background from a few angles."),
                        Step("402", 2, "Weigh & measure", "Weigh the item and note its dimensions for shipping."),
                        Step("402", 3, "Write the listing", "Draft a clear title and description with the key details."),
                        Step("402", 4, "Set price & inventory", "Set the price and enter the on-hand quantity."),
                        Step("402", 5, "Publish", "Review and publish the listing to the store."),
                    }),
                Seq("Process a Return", "Online Store", Cat("Returns"),
                    "Handle a return cleanly and close the loop with the customer.",
                    new List<WorkStep>
                    {
                        Step("403", 1, "Receive the package", "Match the returned parcel to its return request (RMA)."),
                        Step("403", 2, "Inspect the item", "Check the item's condition against the return reason."),
                        Step("403", 3, "Restock or discard", "Return sellable items to stock; set damaged ones aside."),
                        Step("403", 4, "Issue the refund", "Refund the customer for the approved amount."),
                        Step("403", 5, "Close the ticket", "Note the outcome and close the return ticket."),
                    }),
            };

            foreach (var sequence in all)
            {
                if (!context.WorkSequences.Any(s => s.Title == sequence.Title))
                {
                    context.WorkSequences.Add(sequence);
                }
            }

            context.SaveChanges();
        }
    }
}
