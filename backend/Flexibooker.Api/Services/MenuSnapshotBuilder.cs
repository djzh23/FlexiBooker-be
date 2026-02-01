using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Api.Services;

public sealed class MenuSnapshotBuilder
{
    private readonly FlexiBookerDbContext _db;

    public MenuSnapshotBuilder(FlexiBookerDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<MenuCategoryDto>> BuildAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var categories = await _db.Categories.AsNoTracking()
            .Where(c => c.TenantId == tenantId && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);

        if (categories.Count == 0)
            return Array.Empty<MenuCategoryDto>();

        var categoryIds = categories.Select(c => c.Id).ToList();

        var items = await _db.MenuItems.AsNoTracking()
            .Where(i => i.TenantId == tenantId && categoryIds.Contains(i.CategoryId))
            .OrderBy(i => i.Name)
            .ToListAsync(cancellationToken);

        var itemsByCategory = items
            .GroupBy(i => i.CategoryId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<MenuItemDto>)g
                    .Select(i => new MenuItemDto(i.Id, i.Name, i.Description, i.Price, i.ImageUrl, i.IsAvailable))
                    .ToList());

        return categories
            .Select(c => new MenuCategoryDto(
                c.Id,
                c.Name,
                c.SortOrder,
                itemsByCategory.TryGetValue(c.Id, out var list) ? list : Array.Empty<MenuItemDto>()))
            .ToList();
    }
}
