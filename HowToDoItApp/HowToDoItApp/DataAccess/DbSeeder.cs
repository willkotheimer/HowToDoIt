using System;
using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HowToDoItApp.DataAccess
{
    /// <summary>
    /// Applies pending migrations and seeds the example work sequences (coffee-shop
    /// SOPs 101-103 and retail-clerk SOPs 201-203). Image URLs are relative
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

                // ── Bike Shop (301-303) ──────────────────────────────────────────
                Seq("Fix a Flat", "Bike Shop", Cat("Wheels & Tires"),
                    "Repair a flat and get the wheel rolling true again.",
                    new List<WorkStep>
                    {
                        Step("301", 1, "Remove the wheel", "Release the brake, open the quick-release, and lift the wheel out of the dropouts."),
                        Step("301", 2, "Unseat the tire & pull the tube", "Work a tire lever under the bead, run it around the rim, and pull out the punctured tube."),
                        Step("301", 3, "Patch or replace the tube", "Find the hole, buff it, and press on a patch — or swap in a fresh tube."),
                        Step("301", 4, "Reseat the tire", "Tuck the tube in and work the bead back over the rim by hand, checking nothing is pinched."),
                        Step("301", 5, "Inflate & remount", "Inflate to the pressure on the sidewall, drop the wheel back in, and close the quick-release."),
                    }),
                Seq("Adjust Rim Brakes", "Bike Shop", Cat("Brakes"),
                    "Dial in rim brakes for crisp, even stopping power.",
                    new List<WorkStep>
                    {
                        Step("302", 1, "Check pad wear", "Inspect the pads for wear and embedded grit; replace any worn past the line."),
                        Step("302", 2, "Align the pads", "Set each pad to strike the rim squarely, just below the tire, with a slight toe-in."),
                        Step("302", 3, "Set the pad gap", "Balance the spring tension so both pads sit an equal, close distance from the rim."),
                        Step("302", 4, "Tension the cable", "Pull the cable snug at the caliper and lock the pinch bolt."),
                        Step("302", 5, "Test & fine-tune", "Squeeze the lever, spin the wheel to check for rub, and fine-tune with the barrel adjuster."),
                    }),
                Seq("Clean & Lube the Chain", "Bike Shop", Cat("Drivetrain"),
                    "Clean and lubricate the chain for a quiet, smooth-shifting drivetrain.",
                    new List<WorkStep>
                    {
                        // 303-1 "Shift to the small cog" skipped — no photo yet.
                        Step("303", 2, "Degrease the chain", "Scrub the chain with a brush and degreaser, working each link and the cassette."),
                        Step("303", 3, "Wipe it dry", "Backpedal the chain through a clean rag until it runs dry and bright."),
                        Step("303", 4, "Apply lube", "Drip a drop of lube onto each roller while backpedaling slowly."),
                        Step("303", 5, "Wipe the excess", "Backpedal, then wipe off the surplus so the chain is slick but not greasy."),
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
