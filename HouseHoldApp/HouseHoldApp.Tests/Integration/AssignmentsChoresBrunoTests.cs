using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HouseHoldApp.Tests.Integration
{
    public class AssignmentsChoresBrunoTests : IClassFixture<WebApplicationFactory<HouseHoldApp.Startup>>
    {
        private readonly WebApplicationFactory<HouseHoldApp.Startup> _factory;

        public AssignmentsChoresBrunoTests(WebApplicationFactory<HouseHoldApp.Startup> factory)
        {
            _factory = factory;
        }

        private WebApplicationFactory<HouseHoldApp.Startup> BuildFactory(string dbName)
        {
            return _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<HouseholdContext>));
                    if (descriptor != null) services.Remove(descriptor);

                    services.AddDbContext<HouseholdContext>(options =>
                        options.UseInMemoryDatabase(dbName));

                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<HouseholdContext>();
                    db.Database.EnsureCreated();

                    var household = new Household { Id = 1, Name = "Test House" };
                    var user = new Users { Id = 1, Firstname = "Jane", Lastname = "Doe", Email = "jane@test.com", FirebaseKey = "fb-key-1" };
                    var householdUser = new HouseHoldUser { Id = 1, UserId = 1, HouseholdId = 1, IsConfirmed = true };
                    var category = new Category { Id = 1, CategoryName = "Cleaning" };
                    var chore = new Chores { Id = 1, Name = "Vacuum", Description = "Vacuum floors", HouseHoldId = 1, Category = 1 };
                    var assignment = new Assignments { Id = 1, UserId = 1, ChoreId = 1, Week = 23, IsCompleted = false, Rating = 0 };

                    db.Households.Add(household);
                    db.Users.Add(user);
                    db.HouseHoldUsers.Add(householdUser);
                    db.Categories.Add(category);
                    db.Chores.Add(chore);
                    db.Assignments.Add(assignment);
                    db.SaveChanges();
                });
            });
        }

        [Fact]
        public async Task GetAssignmentChoresByHouseholdId_ReturnsSeededData()
        {
            var client = BuildFactory("AssignmentsChoresDb").CreateClient();

            var response = await client.GetAsync("/api/AssignmentsChores/household/1");

            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Vacuum");
        }

        [Fact]
        public async Task GetAssignmentChoresUserByUserId_ReturnsSeededData()
        {
            var client = BuildFactory("AssignmentsChoresUserDb").CreateClient();

            var response = await client.GetAsync("/api/AssignmentsChoresUser/household/user/1");

            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Jane");
        }
    }
}
