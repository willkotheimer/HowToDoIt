using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HouseHoldApp.Filters
{
    /// <summary>
    /// Requires an authenticated user for any state-changing request
    /// (POST/PUT/PATCH/DELETE). Safe (read) methods stay anonymous so the
    /// public sandbox/demo browsing keeps working. Actions explicitly marked
    /// [AllowAnonymous] are skipped.
    /// </summary>
    public class RequireAuthForWritesFilter : IAuthorizationFilter
    {
        private static readonly HashSet<string> SafeMethods =
            new(StringComparer.OrdinalIgnoreCase) { "GET", "HEAD", "OPTIONS", "TRACE" };

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
            }
        }
    }
}
