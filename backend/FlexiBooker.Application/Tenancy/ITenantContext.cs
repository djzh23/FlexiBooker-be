namespace FlexiBooker.Application.Tenancy;

public interface ITenantContext
{
    Guid TenantId { get; }
    string Slug { get; }
}
