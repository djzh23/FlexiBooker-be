using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace FlexiBooker.Api.Services;

public static class TenantConfigService
{
    private static readonly HashSet<string> AllowedFonts = new(StringComparer.OrdinalIgnoreCase)
    {
        "Inter",
        "Poppins",
        "Roboto",
        "Open Sans",
        "Lato",
        "Montserrat",
        "Playfair Display"
    };

    private static readonly Regex HexColorRegex = new("^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", RegexOptions.Compiled);

    private enum MergeStrategy
    {
        Shallow,
        Deep
    }

    public static string MergeAndValidate(string? currentConfigJson, JsonElement patchElement)
    {
        if (patchElement.ValueKind is not JsonValueKind.Object)
            throw new TenantConfigValidationException("Payload must be a JSON object.");

        var current = ParseJsonOrDefault(currentConfigJson);
        var patch = JsonNode.Parse(patchElement.GetRawText())?.AsObject() ?? new JsonObject();
        var strategy = DetermineStrategy(patch);
        patch.Remove("_mergeStrategy");

        if (!patch.Any())
            return current.ToJsonString();

        switch (strategy)
        {
            case MergeStrategy.Deep:
                Merge(current, patch);
                break;
            default:
                ShallowMerge(current, patch);
                break;
        }

        Validate(current);

        return current.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = false
        });
    }

    private static MergeStrategy DetermineStrategy(JsonObject patch)
    {
        if (patch["_mergeStrategy"] is JsonValue value && value.TryGetValue(out string? strategy) && !string.IsNullOrWhiteSpace(strategy))
        {
            if (string.Equals(strategy.Trim(), "deep", StringComparison.OrdinalIgnoreCase))
                return MergeStrategy.Deep;
        }

        return MergeStrategy.Deep;
    }

    private static JsonObject ParseJsonOrDefault(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new JsonObject();

        var node = JsonNode.Parse(json);
        return node as JsonObject ?? new JsonObject();
    }

    private static void Merge(JsonObject target, JsonObject source)
    {
        foreach (var kvp in source)
        {
            if (kvp.Value is JsonObject srcObj)
            {
                if (target[kvp.Key] is JsonObject targetObj)
                {
                    Merge(targetObj, srcObj);
                }
                else
                {
                    target[kvp.Key] = srcObj.DeepClone();
                }
            }
            else
            {
                target[kvp.Key] = kvp.Value?.DeepClone();
            }
        }
    }

    private static void ShallowMerge(JsonObject target, JsonObject source)
    {
        foreach (var kvp in source)
        {
            target[kvp.Key] = kvp.Value?.DeepClone();
        }
    }

    private static void Validate(JsonObject root)
    {
        if (root["brand"] is JsonObject brand)
        {
            ValidateFont(brand, "fontFamily");
            ValidateFont(brand, "headingFontFamily");
            ValidateFontSize(brand, "fontSizeBody", 12, 24);
            ValidateFontSize(brand, "fontSizeHeading", 24, 64);
            ValidateColor(brand, "primaryColor");
            ValidateColor(brand, "secondaryColor");
            ValidateColor(brand, "accentColor");
        }

        if (root["layout"] is JsonObject layout && layout["hero"] is JsonObject hero)
        {
            ValidateImage(hero, "backgroundImage");
        }
    }

    private static void ValidateFont(JsonObject brand, string propertyName)
    {
        if (brand[propertyName] is JsonValue value && value.TryGetValue(out string? font) && !string.IsNullOrWhiteSpace(font))
        {
            var normalized = font.Trim();
            if (!AllowedFonts.Contains(normalized))
                throw new TenantConfigValidationException($"Font '{font}' is not allowed. Allowed values: {string.Join(", ", AllowedFonts)}.");
            brand[propertyName] = normalized;
        }
    }

    private static void ValidateFontSize(JsonObject brand, string propertyName, int min, int max)
    {
        if (brand[propertyName] is JsonValue value && value.TryGetValue(out int size))
        {
            if (size < min || size > max)
                throw new TenantConfigValidationException($"{propertyName} must be between {min} and {max}.");
        }
    }

    private static void ValidateColor(JsonObject brand, string propertyName)
    {
        if (brand[propertyName] is JsonValue value && value.TryGetValue(out string? color) && !string.IsNullOrWhiteSpace(color))
        {
            var normalized = color.Trim();
            if (!IsValidColor(normalized))
                throw new TenantConfigValidationException($"{propertyName} must be a valid HEX or RGB color.");
            brand[propertyName] = normalized;
        }
    }

    private static bool IsValidColor(string value)
    {
        if (HexColorRegex.IsMatch(value))
            return true;

        if (value.StartsWith("rgb", StringComparison.OrdinalIgnoreCase) && value.EndsWith(")"))
            return true;

        return false;
    }

    private static void ValidateImage(JsonObject hero, string propertyName)
    {
        if (hero[propertyName] is JsonValue value && value.TryGetValue(out string? url) && !string.IsNullOrWhiteSpace(url))
        {
            var trimmed = url.Trim();
            if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
                throw new TenantConfigValidationException("Hero background image must be a valid HTTPS URL.");
            hero[propertyName] = trimmed;
        }
    }
}

public sealed class TenantConfigValidationException : Exception
{
    public TenantConfigValidationException(string message) : base(message) { }
}
