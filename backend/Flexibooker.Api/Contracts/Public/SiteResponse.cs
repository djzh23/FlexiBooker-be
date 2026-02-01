namespace FlexiBooker.Api.Contracts.Public;

public sealed record SiteResponse(
    TenantResponse Tenant,
    IReadOnlyList<MenuCategoryDto> Categories
);
