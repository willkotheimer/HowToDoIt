using HouseHoldApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseHoldApp.DataAccess
{
    public class HouseholdContext : DbContext
    {
        public HouseholdContext(DbContextOptions<HouseholdContext> options) : base(options) { }

        public DbSet<Users> Users { get; set; }
        public DbSet<UserHousehold> UserHouseholds { get; set; }
        public DbSet<Images> Images { get; set; }
        public DbSet<Household> Households { get; set; }
        public DbSet<HouseHoldUser> HouseHoldUsers { get; set; }
        public DbSet<Chores> Chores { get; set; }
        public DbSet<Assignments> Assignments { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<ProfileChore> ProfileChores { get; set; }
        public DbSet<ProfileAssignment> ProfileAssignments { get; set; }
        public DbSet<HouseholdSettings> HouseholdSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<HouseHoldUser>()
                .ToTable("HouseholdUser")
                .HasKey(hu => new { hu.UserId, hu.HouseholdId });

            modelBuilder.Entity<HouseHoldUser>()
                .HasOne(hu => hu.User)
                .WithMany(u => u.HouseHoldUsers)
                .HasForeignKey(hu => hu.UserId);

            modelBuilder.Entity<HouseHoldUser>()
                .HasOne(hu => hu.Household)
                .WithMany(h => h.HouseHoldUsers)
                .HasForeignKey(hu => hu.HouseholdId);

            modelBuilder.Entity<HouseholdSettings>()
                .HasIndex(hs => hs.HouseholdId)
                .IsUnique();
        }
    }
}
