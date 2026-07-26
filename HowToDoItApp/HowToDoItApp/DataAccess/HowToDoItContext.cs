using HowToDoItApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HowToDoItApp.DataAccess
{
    /// <summary>
    /// EF Core context for HowToDoIt. All tables live under the "howtodoit" SQL
    /// schema (see HasDefaultSchema below) so this app shares the physical
    /// database with Household (dbo.*) while staying fully isolated. The
    /// migrations history table is likewise namespaced to howtodoit (configured
    /// where the context is registered in Startup).
    /// </summary>
    public class HowToDoItContext : DbContext
    {
        public HowToDoItContext(DbContextOptions<HowToDoItContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<WorkSequence> WorkSequences { get; set; }
        public DbSet<WorkStep> WorkSteps { get; set; }
        public DbSet<StepImage> StepImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("howtodoit");

            // Sequence -> Steps: deleting a sequence removes its steps.
            modelBuilder.Entity<WorkStep>()
                .HasOne(s => s.WorkSequence)
                .WithMany(seq => seq.Steps)
                .HasForeignKey(s => s.WorkSequenceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Step -> Images: deleting a step removes its images.
            modelBuilder.Entity<StepImage>()
                .HasOne(i => i.WorkStep)
                .WithMany(s => s.Images)
                .HasForeignKey(i => i.WorkStepId)
                .OnDelete(DeleteBehavior.Cascade);

            // Category -> Sequences: deleting a category leaves its sequences
            // uncategorized rather than deleting them.
            modelBuilder.Entity<WorkSequence>()
                .HasOne(seq => seq.Category)
                .WithMany()
                .HasForeignKey(seq => seq.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
