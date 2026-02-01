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

        var hostName = context.Request.Host.Host?.ToLowerInvariant();

        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug || (hostName != null && t.PrimaryDomain == hostName));

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

        // 2) query parameters (?tenant=slug or ?slug=slug)
        var query = context.Request.Query;
        if (TryReadQuerySlug(query, "tenant", out var tenantQuerySlug))
            return tenantQuerySlug;

        if (TryReadQuerySlug(query, "slug", out var slugQuerySlug))
            return slugQuerySlug;

        // 3) subdomain: {slug}.flexibooker.com
        var host = context.Request.Host.Host; // e.g. marios.flexibooker.local
        var parts = host.Split('.', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length >= 3)
            return parts[0].Trim().ToLowerInvariant();

        return null;
    }

    private static bool TryReadQuerySlug(IQueryCollection query, string key, out string? slug)
    {
        slug = null;
        if (!query.TryGetValue(key, out var values)) return false;
        var value = values.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(value)) return false;
        slug = value.Trim().ToLowerInvariant();
        return true;
    }
}
