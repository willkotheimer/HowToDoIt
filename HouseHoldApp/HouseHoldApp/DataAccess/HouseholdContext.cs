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
        public DbSet<HouseholdUser> HouseholdUsers { get; set; }
        public DbSet<Chores> Chores { get; set; }
        public DbSet<Assignments> Assignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<HouseholdUser>()
                .HasKey(hu => new { hu.UserId, hu.HouseholdId });

            modelBuilder.Entity<HouseholdUser>()
                .HasOne(hu => hu.User)
                .WithMany(u => u.HouseholdUsers)
                .HasForeignKey(hu => hu.UserId);

            modelBuilder.Entity<HouseholdUser>()
                .HasOne(hu => hu.Household)
                .WithMany(h => h.HouseholdUsers)
                .HasForeignKey(hu => hu.HouseholdId);
        }
    }
}
