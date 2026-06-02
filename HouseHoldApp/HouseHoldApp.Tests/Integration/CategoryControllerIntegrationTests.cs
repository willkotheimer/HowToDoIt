using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace HouseHoldApp.Tests.Integration
{
    public class CategoryControllerIntegrationTests : IClassFixture<WebApplicationFactory<HouseHoldApp.Startup>>
    {
        private readonly WebApplicationFactory<HouseHoldApp.Startup> _factory;

        public CategoryControllerIntegrationTests(WebApplicationFactory<HouseHoldApp.Startup> factory)
        {
            _factory = factory;
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
