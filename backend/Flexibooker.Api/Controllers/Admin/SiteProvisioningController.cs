using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FlexiBooker.Api.Contracts.Admin;
using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Api.Options;
using FlexiBooker.Api.Services;
using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlexiBooker.Api.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/sites")]
public sealed class SiteProvisioningController : ControllerBase
{
    private readonly FlexiBookerDbContext _db;
    private readonly MenuSnapshotBuilder _menuSnapshot;
    private readonly IOptions<AdminOptions> _adminOptions;
    private readonly ILogger<SiteProvisioningController> _logger;

    public SiteProvisioningController(
        FlexiBookerDbContext db,
        MenuSnapshotBuilder menuSnapshot,
        IOptions<AdminOptions> adminOptions,
        ILogger<SiteProvisioningController> logger)
    {
        _db = db;
        _menuSnapshot = menuSnapshot;
        _adminOptions = adminOptions;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<SiteResponse>> Upsert([FromBody] SiteProvisionRequest request, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        if (string.IsNullOrWhiteSpace(request.Slug) || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Slug and Name are required.");

        _logger.LogInformation("=== PATCH REQUEST (Provision) === Tenant: {Tenant} Payload: {Payload}", request.Slug, request.Config.GetRawText());

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == normalizedSlug, cancellationToken);

        if (tenant is null)
        {
            tenant = new Tenant(normalizedSlug, request.Name, timezone: request.Timezone, currency: request.Currency);
            _db.Tenants.Add(tenant);
        }
        else
        {
            tenant.Rename(request.Name);
            tenant.UpdateRegionalSettings(request.Timezone, request.Currency);
        }

        var configError = ApplyConfigPatch(tenant, request.Config);
        if (configError is not null)
            return configError;

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("DB changes persisted for tenant {Tenant}", tenant.Slug);

        var existingItems = await _db.MenuItems.Where(i => i.TenantId == tenant.Id).ToListAsync(cancellationToken);
        if (existingItems.Count > 0)
            _db.MenuItems.RemoveRange(existingItems);

        var existingCategories = await _db.Categories.Where(c => c.TenantId == tenant.Id).ToListAsync(cancellationToken);
        if (existingCategories.Count > 0)
            _db.Categories.RemoveRange(existingCategories);

        await _db.SaveChangesAsync(cancellationToken);

        var newCategories = new List<Category>();
        if (request.Categories is not null)
        {
            foreach (var categoryDto in request.Categories.OrderBy(c => c.SortOrder))
            {
                var category = new Category(tenant.Id, categoryDto.Name, categoryDto.SortOrder);
                newCategories.Add(category);
            }

            if (newCategories.Count > 0)
            {
                _db.Categories.AddRange(newCategories);
                await _db.SaveChangesAsync(cancellationToken);
            }

            var menuItems = new List<MenuItem>();
            foreach (var categoryDto in request.Categories)
            {
                var category = newCategories.FirstOrDefault(c => string.Equals(c.Name, categoryDto.Name, StringComparison.OrdinalIgnoreCase));
                if (category is null || categoryDto.Items is null) continue;

                menuItems.AddRange(categoryDto.Items.Select(itemDto => new MenuItem(
                    tenant.Id,
                    category.Id,
                    itemDto.Name,
                    itemDto.Price,
                    itemDto.Description,
                    itemDto.ImageUrl,
                    itemDto.IsAvailable)));
            }

            if (menuItems.Count > 0)
            {
                _db.MenuItems.AddRange(menuItems);
                await _db.SaveChangesAsync(cancellationToken);
            }
        }

        await tx.CommitAsync(cancellationToken);

        var tenantResponse = new TenantResponse(
            tenant.Slug,
            tenant.Name,
            tenant.Timezone,
            tenant.Currency,
            tenant.ConfigJson);

        var menuSnapshot = await _menuSnapshot.BuildAsync(tenant.Id, cancellationToken);

        return Ok(new SiteResponse(tenantResponse, menuSnapshot));
    }

    [HttpPatch("{tenantSlug}")]
    public async Task<ActionResult<SiteResponse>> UpdateConfig(string tenantSlug, [FromBody] JsonElement patch, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        _logger.LogInformation("=== PATCH REQUEST === Tenant: {Tenant} Payload: {Payload}", tenantSlug, patch.GetRawText());

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);
        if (tenant is null)
            return NotFound($"Tenant '{tenantSlug}' not found.");

        var configError = ApplyConfigPatch(tenant, patch);
        if (configError is not null)
            return configError;

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("DB changes persisted for tenant {Tenant}", tenant.Slug);

        var tenantResponse = new TenantResponse(
            tenant.Slug,
            tenant.Name,
            tenant.Timezone,
            tenant.Currency,
            tenant.ConfigJson);

        var snapshot = await _menuSnapshot.BuildAsync(tenant.Id, cancellationToken);
        return Ok(new SiteResponse(tenantResponse, snapshot));
    }

    private ActionResult? ApplyConfigPatch(Tenant tenant, JsonElement element)
    {
        if (!HasPayload(element))
            return null;

        try
        {
            var merged = TenantConfigService.MergeAndValidate(tenant.ConfigJson, element);
            Console.WriteLine("=== BEFORE DB SAVE ===");
            Console.WriteLine($"Config nach Merge: {merged}");
            tenant.UpdateConfig(merged);
            Console.WriteLine("=== AFTER DB SAVE ===");
            Console.WriteLine("Config gespeichert in DB");
            return null;
        }
        catch (TenantConfigValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for tenant {Tenant}", tenant.Slug);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while merging config for tenant {Tenant}", tenant.Slug);
            throw;
        }
    }

    private static bool HasPayload(JsonElement element) =>
        element.ValueKind switch
        {
            JsonValueKind.Undefined => false,
            JsonValueKind.Null => false,
            JsonValueKind.Object => element.EnumerateObject().Any(),
            _ => true
        };

    private bool IsAuthorized()
    {
        var configuredKey = _adminOptions.Value.ApiKey;
        if (string.IsNullOrWhiteSpace(configuredKey))
            return false;

        var providedKey = Request.Headers["X-Admin-Key"].FirstOrDefault();
        return !string.IsNullOrWhiteSpace(providedKey) && string.Equals(providedKey, configuredKey, StringComparison.Ordinal);
    }
}
