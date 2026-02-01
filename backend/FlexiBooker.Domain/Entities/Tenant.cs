using System;
using Newtonsoft.Json.Linq;

namespace FlexiBooker.Domain.Entities;

public sealed class Tenant
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    // "marios" -> used in subdomain
    public string Slug { get; private set; } = default!;

    public string Name { get; private set; } = default!;
    public string? PrimaryDomain { get; private set; }
    public string Timezone { get; private set; } = "Europe/Berlin";
    public string Currency { get; private set; } = "EUR";

    public string ConfigJson { get; private set; } = "{}";

    private Tenant() { }

    public Tenant(string slug, string name, string? primaryDomain = null, string? timezone = null, string? currency = null)
    {
        Slug = slug.Trim().ToLowerInvariant();
        Name = name.Trim();
        PrimaryDomain = primaryDomain?.Trim().ToLowerInvariant();
        UpdateRegionalSettings(timezone, currency);
    }

    public void UpdateConfig(string configJson)
    {
        if (string.IsNullOrWhiteSpace(configJson))
            return;

        try
        {
            var existing = string.IsNullOrWhiteSpace(ConfigJson) || ConfigJson == "{}"
                ? new JObject()
                : JObject.Parse(ConfigJson);

            var update = JObject.Parse(configJson);
            var merged = DeepMerge(existing, update);
            ConfigJson = merged.ToString();
        }
        catch
        {
            ConfigJson = configJson;
        }
    }

    private static JObject DeepMerge(JObject target, JObject source)
    {
        var result = target.DeepClone() as JObject ?? new JObject();

        foreach (var property in source.Properties())
        {
            if (result[property.Name] is JObject targetObj && property.Value is JObject sourceObj)
            {
                result[property.Name] = DeepMerge(targetObj, sourceObj);
            }
            else
            {
                result[property.Name] = property.Value.DeepClone();
            }
        }

        return result;
    }

    public void UpdateRegionalSettings(string? timezone, string? currency)
    {
        if (!string.IsNullOrWhiteSpace(timezone))
            Timezone = timezone.Trim();

        if (!string.IsNullOrWhiteSpace(currency))
            Currency = currency.Trim().ToUpperInvariant();
    }

    public void Rename(string name)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
    }
}
