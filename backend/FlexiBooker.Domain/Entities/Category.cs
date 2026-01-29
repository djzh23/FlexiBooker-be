using FlexiBooker.Domain.Abstractions;

namespace FlexiBooker.Domain.Entities;

public sealed class Category : ITenantEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }

    public string Name { get; private set; } = default!;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Category() { }

    public Category(Guid tenantId, string name, int sortOrder = 0)
    {
        TenantId = tenantId;
        Name = name.Trim();
        SortOrder = sortOrder;
    }

    public void Deactivate() => IsActive = false;
}
