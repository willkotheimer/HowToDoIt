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
    ///   2. The caller must match the single-writer allow-list -> else 403. The UI
    ///      allow-list is UX-only and cannot be trusted.
    ///
    /// A caller is allowed if EITHER holds:
    ///   - their email-bearing claim is in Auth:AllowedWriters, OR
    ///   - their object-id (oid) claim is in Auth:AllowedWriterObjectIds.
    ///
    /// The object-id path exists because Entra External ID (CIAM) does not put a
    /// usable email on the access token for social-federated (e.g. Google) logins:
    /// the token's preferred_username is a synthetic {oid}@tenant.onmicrosoft.com
    /// UPN, and no "email" claim is emitted unless added as an optional claim.
    /// The oid is stable per user and always present, so it is the reliable key.
    /// Fail-closed: no matching identity -> deny.
    /// </summary>
    public class RequireAuthForWritesFilter : IAuthorizationFilter
    {
        private static readonly HashSet<string> SafeMethods =
            new(StringComparer.OrdinalIgnoreCase) { "GET", "HEAD", "OPTIONS", "TRACE" };

        // Claim types that may carry the caller's email, in preference order.
        private static readonly string[] EmailClaimTypes = { "email", "preferred_username", "emails" };

        // Claim types that may carry the caller's stable object id.
        private static readonly string[] ObjectIdClaimTypes =
        {
            "oid",
            "http://schemas.microsoft.com/identity/claims/objectidentifier",
        };

        private readonly HashSet<string> _allowedWriters;
        private readonly HashSet<string> _allowedWriterObjectIds;

        public RequireAuthForWritesFilter(IConfiguration configuration)
        {
            _allowedWriters = LoadSet(configuration, "Auth:AllowedWriters");
            _allowedWriterObjectIds = LoadSet(configuration, "Auth:AllowedWriterObjectIds");
        }

        private static HashSet<string> LoadSet(IConfiguration configuration, string key)
        {
            var configured = configuration.GetSection(key).Get<string[]>() ?? Array.Empty<string>();
            return configured
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Select(v => v.Trim().ToLowerInvariant())
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

            var email = FirstClaim(user, EmailClaimTypes);
            var objectId = FirstClaim(user, ObjectIdClaimTypes);

            var allowed =
                (email != null && _allowedWriters.Contains(email)) ||
                (objectId != null && _allowedWriterObjectIds.Contains(objectId));

            if (!allowed)
            {
                context.Result = new ObjectResult("You are not authorized to make changes.")
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }

        private static string FirstClaim(System.Security.Claims.ClaimsPrincipal user, string[] types) =>
            types
                .Select(type => user.FindFirst(type)?.Value)
                .FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))
                ?.Trim()
                .ToLowerInvariant();
    }
}
