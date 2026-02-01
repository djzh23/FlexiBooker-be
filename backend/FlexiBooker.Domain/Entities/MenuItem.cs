using System;
using FlexiBooker.Domain.Abstractions;

namespace FlexiBooker.Domain.Entities;

public sealed class MenuItem : ITenantEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }

    public Guid CategoryId { get; private set; }
    public Category? Category { get; private set; }

    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }

    public decimal Price { get; private set; }
    public string? ImageUrl { get; private set; }

    public bool IsAvailable { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private MenuItem() { }

    public MenuItem(Guid tenantId, Guid categoryId, string name, decimal price, string? description = null, string? imageUrl = null, bool isAvailable = true)
    {
        TenantId = tenantId;
        CategoryId = categoryId;
        Name = name.Trim();
        Price = price;
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        IsAvailable = isAvailable;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public void SetAvailability(bool available)
    {
        IsAvailable = available;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string? name = null,
        decimal? price = null,
        string? description = null,
        string? imageUrl = null,
        bool? isAvailable = null,
        Guid? categoryId = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();

        if (price.HasValue)
            Price = price.Value;

        if (description is not null)
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();

        if (imageUrl is not null)
            ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();

        if (isAvailable.HasValue)
            IsAvailable = isAvailable.Value;

        if (categoryId.HasValue)
            CategoryId = categoryId.Value;

        UpdatedAt = DateTime.UtcNow;
    }
}
