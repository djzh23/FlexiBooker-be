namespace FlexiBooker.Domain.Entities;

public sealed class Tenant
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    // "marios" -> used in subdomain
    public string Slug { get; private set; } = default!;

    public string Name { get; private set; } = default!;
    public string? PrimaryDomain { get; private set; } // e.g. marios-pizza.de
    public string Timezone { get; private set; } = "Europe/Berlin";
    public string Currency { get; private set; } = "EUR";

    // In MVP: store config as JSON string (later: typed config)
    public string ConfigJson { get; private set; } = "{}";

    // EF
    private Tenant() { }

    public Tenant(string slug, string name, string? primaryDomain = null)
    {
        Slug = slug.Trim().ToLowerInvariant();
        Name = name.Trim();
        PrimaryDomain = primaryDomain?.Trim().ToLowerInvariant();
    }

    public void UpdateConfig(string configJson)
    {
        ConfigJson = string.IsNullOrWhiteSpace(configJson) ? "{}" : configJson;
    }
}
