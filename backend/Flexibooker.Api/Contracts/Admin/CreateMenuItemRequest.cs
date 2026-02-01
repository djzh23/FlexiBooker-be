namespace FlexiBooker.Api.Contracts.Admin;

public sealed record CreateMenuItemRequest(
    string Name,
    decimal Price,
    string? Description,
    Guid CategoryId,
    string? ImageUrl,
    bool? IsAvailable
);
