using FlexiBooker.Application.Tenancy;

namespace FlexiBooker.Infrastructure.Tenancy;

public sealed class TenantContext : ITenantContext
{
    public Guid TenantId { get; private set; }
    public string Slug { get; private set; } = default!;

    public void Set(Guid tenantId, string slug)
    {
        TenantId = tenantId;
        Slug = slug;
    }
}
