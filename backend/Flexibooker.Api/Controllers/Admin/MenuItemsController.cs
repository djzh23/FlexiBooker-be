using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FlexiBooker.Api.Contracts.Admin;
using FlexiBooker.Api.Options;
using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlexiBooker.Api.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/sites/{tenantSlug}/items")]
public sealed class MenuItemsController : ControllerBase
{
    private readonly FlexiBookerDbContext _db;
    private readonly IOptions<AdminOptions> _adminOptions;

    public MenuItemsController(FlexiBookerDbContext db, IOptions<AdminOptions> adminOptions)
    {
        _db = db;
        _adminOptions = adminOptions;
    }

    [HttpPost]
    public async Task<ActionResult<MenuItemAdminResponse>> Create(
        string tenantSlug,
        [FromBody] CreateMenuItemRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);
        if (tenant is null)
            return NotFound($"Tenant '{tenantSlug}' not found.");

        var category = await _db.Categories.FirstOrDefaultAsync(
            c => c.Id == request.CategoryId && c.TenantId == tenant.Id,
            cancellationToken);

        if (category is null)
            return BadRequest("Category does not exist for this tenant.");

        var item = new MenuItem(
            tenant.Id,
            category.Id,
            request.Name,
            request.Price,
            request.Description,
            request.ImageUrl,
            request.IsAvailable ?? true);

        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { tenantSlug, itemId = item.Id }, ToResponse(item));
    }

    [HttpGet("{itemId:guid}")]
    public async Task<ActionResult<MenuItemAdminResponse>> GetById(string tenantSlug, Guid itemId, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);
        if (tenant is null)
            return NotFound($"Tenant '{tenantSlug}' not found.");

        var item = await _db.MenuItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenant.Id, cancellationToken);
        if (item is null)
            return NotFound();

        return Ok(ToResponse(item));
    }

    [HttpPatch("{itemId:guid}")]
    public async Task<ActionResult<MenuItemAdminResponse>> Update(
        string tenantSlug,
        Guid itemId,
        [FromBody] UpdateMenuItemRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);
        if (tenant is null)
            return NotFound($"Tenant '{tenantSlug}' not found.");

        var item = await _db.MenuItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenant.Id, cancellationToken);
        if (item is null)
            return NotFound();

        Guid? newCategoryId = null;
        if (request.CategoryId.HasValue)
        {
            var category = await _db.Categories.FirstOrDefaultAsync(
                c => c.Id == request.CategoryId.Value && c.TenantId == tenant.Id,
                cancellationToken);

            if (category is null)
                return BadRequest("Category does not exist for this tenant.");

            newCategoryId = category.Id;
        }

        item.UpdateDetails(
            request.Name,
            request.Price,
            request.Description,
            request.ImageUrl,
            request.IsAvailable,
            newCategoryId);

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(item));
    }

    [HttpDelete("{itemId:guid}")]
    public async Task<IActionResult> Delete(string tenantSlug, Guid itemId, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
            return Unauthorized("Missing or invalid X-Admin-Key header.");

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);
        if (tenant is null)
            return NotFound($"Tenant '{tenantSlug}' not found.");

        var item = await _db.MenuItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenant.Id, cancellationToken);
        if (item is null)
            return NotFound();

        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private bool IsAuthorized()
    {
        var configuredKey = _adminOptions.Value.ApiKey;
        if (string.IsNullOrWhiteSpace(configuredKey))
            return false;

        var providedKey = Request.Headers["X-Admin-Key"].FirstOrDefault();
        return !string.IsNullOrWhiteSpace(providedKey) && string.Equals(providedKey, configuredKey, StringComparison.Ordinal);
    }

    private static MenuItemAdminResponse ToResponse(MenuItem item) =>
        new(
            item.Id,
            item.TenantId,
            item.CategoryId,
            item.Name,
            item.Price,
            item.Description,
            item.ImageUrl,
            item.IsAvailable,
            item.CreatedAt,
            item.UpdatedAt);
}
