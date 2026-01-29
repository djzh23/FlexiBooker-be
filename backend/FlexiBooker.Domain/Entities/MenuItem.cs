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

    public decimal Price { get; private set; } // EUR etc.
    public string? ImageUrl { get; private set; }

    public bool IsAvailable { get; private set; } = true;

    private MenuItem() { }

    public MenuItem(Guid tenantId, Guid categoryId, string name, decimal price, string? description = null, string? imageUrl = null)
    {
        TenantId = tenantId;
        CategoryId = categoryId;
        Name = name.Trim();
        Price = price;
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
    }

    public void SetAvailability(bool available) => IsAvailable = available;
}
