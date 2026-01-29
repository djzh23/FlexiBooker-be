namespace FlexiBooker.Api.Contracts.Public;

public sealed record MenuResponse(IReadOnlyList<MenuCategoryDto> Categories);

public sealed record MenuCategoryDto(
    Guid Id,
    string Name,
    int SortOrder,
    IReadOnlyList<MenuItemDto> Items
);

public sealed record MenuItemDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    bool IsAvailable
);
