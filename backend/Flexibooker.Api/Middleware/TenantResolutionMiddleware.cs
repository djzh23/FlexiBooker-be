using FlexiBooker.Application.Tenancy;
using FlexiBooker.Infrastructure.Persistence;
using FlexiBooker.Infrastructure.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Api.Middleware;

public sealed class TenantResolutionMiddleware : IMiddleware
{
    private const string TenantHeader = "X-Tenant";

    private readonly FlexiBookerDbContext _db;
    private readonly TenantContext _tenantContext;

    public TenantResolutionMiddleware(FlexiBookerDbContext db, TenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var slug = ResolveSlug(context);

        if (string.IsNullOrWhiteSpace(slug))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Tenant not specified.");
            return;
        }

        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug || t.PrimaryDomain == context.Request.Host.Host.ToLower());

        if (tenant is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync("Tenant not found.");
            return;
        }

        _tenantContext.Set(tenant.Id, tenant.Slug);

        await next(context);
    }

    private static string? ResolveSlug(HttpContext context)
    {
        // 1) custom header for dev/testing
        if (context.Request.Headers.TryGetValue(TenantHeader, out var headerValues))
        {
            var headerSlug = headerValues.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(headerSlug))
                return headerSlug.Trim().ToLowerInvariant();
        }

        // 2) subdomain: {slug}.flexibooker.com
        var host = context.Request.Host.Host; // e.g. marios.flexibooker.local
        var parts = host.Split('.', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length >= 3)
            return parts[0].Trim().ToLowerInvariant();

        return null;
    }
}
