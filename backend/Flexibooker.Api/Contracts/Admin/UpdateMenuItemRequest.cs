namespace FlexiBooker.Api.Contracts.Admin;

public sealed record UpdateMenuItemRequest(
    string? Name,
    decimal? Price,
    string? Description,
    bool? IsAvailable,
    string? ImageUrl,
    Guid? CategoryId
);
