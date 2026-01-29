using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Application.Tenancy;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Api.Controllers.Public;

[ApiController]
[Route("api/v1/public/menu")]
public sealed class MenuController : ControllerBase
{
    private readonly ITenantContext _tenant;
    private readonly FlexiBookerDbContext _db;

    public MenuController(ITenantContext tenant, FlexiBookerDbContext db)
    {
        _tenant = tenant;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<MenuResponse>> Get()
    {
        var tenantId = _tenant.TenantId;

        var categories = await _db.Categories.AsNoTracking()
            .Where(c => c.TenantId == tenantId && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        var categoryIds = categories.Select(c => c.Id).ToList();

        var items = await _db.MenuItems.AsNoTracking()
            .Where(i => i.TenantId == tenantId && categoryIds.Contains(i.CategoryId))
            .OrderBy(i => i.Name)
            .ToListAsync();

        var itemsByCategory = items.GroupBy(i => i.CategoryId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<MenuItemDto>)g
                .Select(i => new MenuItemDto(i.Id, i.Name, i.Description, i.Price, i.ImageUrl, i.IsAvailable))
                .ToList());

        var result = categories.Select(c => new MenuCategoryDto(
            c.Id,
            c.Name,
            c.SortOrder,
            itemsByCategory.TryGetValue(c.Id, out var list) ? list : Array.Empty<MenuItemDto>()
        )).ToList();

        return Ok(new MenuResponse(result));
    }
}
