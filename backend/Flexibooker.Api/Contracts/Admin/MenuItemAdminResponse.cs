namespace FlexiBooker.Api.Contracts.Admin;

public sealed record MenuItemAdminResponse(
    Guid Id,
    Guid TenantId,
    Guid CategoryId,
    string Name,
    decimal Price,
    string? Description,
    string? ImageUrl,
    bool IsAvailable,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
