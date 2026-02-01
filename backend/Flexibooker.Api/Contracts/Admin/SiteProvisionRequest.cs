using System.Text.Json;

namespace FlexiBooker.Api.Contracts.Admin;

public sealed record SiteProvisionRequest(
    string Slug,
    string Name,
    string Timezone,
    string Currency,
    JsonElement Config,
    IReadOnlyList<MenuCategoryProvisionRequest>? Categories
);

public sealed record MenuCategoryProvisionRequest(
    string Name,
    int SortOrder,
    IReadOnlyList<MenuItemProvisionRequest>? Items
);

public sealed record MenuItemProvisionRequest(
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    bool IsAvailable = true
);
