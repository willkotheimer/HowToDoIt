using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using HouseHoldApp.DataAccess;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HouseHoldApp.Tests.Integration
{
    public class CategoryControllerIntegrationTests : IClassFixture<WebApplicationFactory<HouseHoldApp.Startup>>
    {
        private readonly WebApplicationFactory<HouseHoldApp.Startup> _factory;

        public CategoryControllerIntegrationTests(WebApplicationFactory<HouseHoldApp.Startup> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<HouseholdContext>));
                    if (descriptor != null) services.Remove(descriptor);

                    services.AddDbContext<HouseholdContext>(options =>
                        options.UseInMemoryDatabase("IntegrationTestDb"));

                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<HouseholdContext>();
                    db.Database.EnsureCreated();
                });
            });
        }

        [Fact]
        public async Task GetAllCategories_ReturnsSuccess()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/api/Categories");

            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        }
    }
}
