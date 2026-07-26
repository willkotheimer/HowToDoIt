using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;

namespace HowToDoItApp.Filters
{
    /// <summary>
    /// Gates state-changing requests (POST/PUT/PATCH/DELETE). Safe (read) methods
    /// stay anonymous so the public browsing experience keeps working. Actions
    /// explicitly marked [AllowAnonymous] are skipped.
    ///
    /// Two-stage enforcement for unsafe methods:
    ///   1. The caller must be authenticated (valid bearer token) -> else 401.
    ///   2. The caller's email must be in the Auth:AllowedWriters allow-list
    ///      -> else 403. This is the server-side single-writer lockdown; the UI
    ///      allow-list is UX-only and cannot be trusted.
    ///
    /// Fail-closed: if the token carries no email claim we deny (403). Entra
    /// External ID only emits an email claim on access tokens when it is added
    /// as an optional claim on the API app registration. If legitimate writes
    /// 403 with a valid login, add "email" (and/or "preferred_username") as an
    /// optional claim in the Entra portal -- this code already reads all three.
    /// </summary>
    public class RequireAuthForWritesFilter : IAuthorizationFilter
    {
        private static readonly HashSet<string> SafeMethods =
            new(StringComparer.OrdinalIgnoreCase) { "GET", "HEAD", "OPTIONS", "TRACE" };

        // Claim types that may carry the caller's email, in preference order.
        private static readonly string[] EmailClaimTypes = { "email", "preferred_username", "emails" };

        private readonly HashSet<string> _allowedWriters;

        public RequireAuthForWritesFilter(IConfiguration configuration)
        {
            var configured = configuration.GetSection("Auth:AllowedWriters").Get<string[]>()
                             ?? Array.Empty<string>();
            _allowedWriters = configured
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Select(e => e.Trim().ToLowerInvariant())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.ActionDescriptor.EndpointMetadata.Any(m => m is IAllowAnonymous))
            {
                return;
            }

            if (SafeMethods.Contains(context.HttpContext.Request.Method))
            {
                return;
            }

            var user = context.HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var email = EmailClaimTypes
                .Select(type => user.FindFirst(type)?.Value)
                .FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))
                ?.Trim()
                .ToLowerInvariant();

            if (email == null || !_allowedWriters.Contains(email))
            {
                context.Result = new ObjectResult("You are not authorized to make changes.")
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}
