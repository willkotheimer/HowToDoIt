using System.Collections.Generic;
using System.Security.Claims;
using FluentAssertions;
using HowToDoItApp.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace HowToDoItApp.Tests.Filters
{
    public class RequireAuthForWritesFilterTests
    {
        private static RequireAuthForWritesFilter CreateFilter(params string[] allowedWriters)
        {
            var settings = new Dictionary<string, string>();
            for (var i = 0; i < allowedWriters.Length; i++)
            {
                settings[$"Auth:AllowedWriters:{i}"] = allowedWriters[i];
            }

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();

            return new RequireAuthForWritesFilter(configuration);
        }

        private static AuthorizationFilterContext CreateContext(string method, ClaimsPrincipal user)
        {
            var httpContext = new DefaultHttpContext { User = user };
            httpContext.Request.Method = method;

            var actionContext = new ActionContext(
                httpContext,
                new RouteData(),
                new ActionDescriptor());

            return new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
        }

        private static ClaimsPrincipal Anonymous() => new(new ClaimsIdentity());

        private static ClaimsPrincipal Authenticated(params Claim[] claims) =>
            new(new ClaimsIdentity(claims, authenticationType: "TestAuth"));

        [Theory]
        [InlineData("GET")]
        [InlineData("HEAD")]
        [InlineData("OPTIONS")]
        public void SafeMethods_AreAlwaysAllowed_EvenWhenAnonymous(string method)
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext(method, Anonymous());

            filter.OnAuthorization(context);

            context.Result.Should().BeNull();
        }

        [Fact]
        public void UnauthenticatedWrite_Returns401()
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext("POST", Anonymous());

            filter.OnAuthorization(context);

            context.Result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public void AuthenticatedAllowedWriter_ViaEmailClaim_IsAllowed()
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext("POST", Authenticated(new Claim("email", "wkotheimer@gmail.com")));

            filter.OnAuthorization(context);

            context.Result.Should().BeNull();
        }

        [Fact]
        public void AuthenticatedAllowedWriter_ViaPreferredUsername_IsAllowed()
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext("PUT",
                Authenticated(new Claim("preferred_username", "WKotheimer@Gmail.com")));

            filter.OnAuthorization(context);

            context.Result.Should().BeNull();
        }

        [Fact]
        public void AuthenticatedDisallowedWriter_Returns403()
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext("DELETE", Authenticated(new Claim("email", "someone-else@gmail.com")));

            filter.OnAuthorization(context);

            context.Result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        }

        [Fact]
        public void AuthenticatedWithNoEmailClaim_FailsClosed_Returns403()
        {
            var filter = CreateFilter("wkotheimer@gmail.com");
            var context = CreateContext("POST", Authenticated(new Claim("sub", "abc-123")));

            filter.OnAuthorization(context);

            context.Result.Should().BeOfType<ObjectResult>()
                .Which.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        }
    }
}
