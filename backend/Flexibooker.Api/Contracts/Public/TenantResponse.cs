namespace FlexiBooker.Api.Contracts.Public;

public sealed record TenantResponse(
    string Slug,
    string Name,
    string Timezone,
    string Currency,
    string ConfigJson
);
