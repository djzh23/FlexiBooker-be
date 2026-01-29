namespace FlexiBooker.Domain.Abstractions;

public interface ITenantEntity
{
    Guid TenantId { get; }
}
