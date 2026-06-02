using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Xunit;
using System.Linq;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Tests.Integration
{
    // Bruno-style black box test: run a WebApplicationFactory, replace DbContext with InMemory DB,
    // seed a Category and hit the API.
    public class CategoryControllerBrunoTests : IClassFixture<WebApplicationFactory<HouseHoldApp.Startup>>
    {
        private readonly WebApplicationFactory<HouseHoldApp.Startup> _factory;

        public CategoryControllerBrunoTests(WebApplicationFactory<HouseHoldApp.Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GetAllCategories_WithInMemoryDb_ReturnsSeededCategory()
        {
            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // remove existing DbContext registration
                    var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<HouseholdContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // add in-memory db
                    services.AddDbContext<HouseholdContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb");
                    });

                    // build the provider to seed data
                    var sp = services.BuildServiceProvider();
                    using (var scope = sp.CreateScope())
                    {
                        var scopedServices = scope.ServiceProvider;
                        var db = scopedServices.GetRequiredService<HouseholdContext>();
                        db.Database.EnsureCreated();

                        // seed a category
                        db.Categories.Add(new Category { CategoryName = "TestCat" });
                        db.SaveChanges();
                    }
                });
            }).CreateClient();

            var response = await client.GetAsync("/api/Categories");

            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("TestCat");
        }
    }
}
