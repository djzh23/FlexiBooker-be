using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Seeding;

public static class TenantSeeder
{
    public static async Task SeedAsync(FlexiBookerDbContext db)
    {
        var seeds = new[]
        {
            new TenantSeed(
                Slug: "tacos-mohammedia",
                Name: "Makin Hir Tacos",
                Timezone: "Africa/Casablanca",
                Currency: "MAD",
                ConfigJson: TacosConfig),
            new TenantSeed(
                Slug: "pizzeria-roma",
                Name: "Pizzeria Roma",
                Timezone: "Africa/Casablanca",
                Currency: "MAD",
                ConfigJson: PizzaConfig)
        };

        foreach (var seed in seeds)
        {
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Slug == seed.Slug);

            if (tenant is null)
            {
                tenant = new Tenant(seed.Slug, seed.Name, timezone: seed.Timezone, currency: seed.Currency);
                tenant.UpdateConfig(seed.ConfigJson);
                db.Tenants.Add(tenant);
            }
            else
            {
                tenant.Rename(seed.Name);
                tenant.UpdateRegionalSettings(seed.Timezone, seed.Currency);

                // ✅ NUR UpdateConfig aufrufen wenn Config wirklich leer ist
                // Die neue Deep Merge in UpdateConfig() wird benutzt
                if (ShouldSeedConfig(tenant))
                {
                    tenant.UpdateConfig(seed.ConfigJson);
                }
            }
        }

        await db.SaveChangesAsync();
    }

    private static bool ShouldSeedConfig(Tenant tenant) =>
        string.IsNullOrWhiteSpace(tenant.ConfigJson) || tenant.ConfigJson == "{}";

    private sealed record TenantSeed(string Slug, string Name, string Timezone, string Currency, string ConfigJson);

    private const string TacosConfig = """
    {
      "brand": {
        "primaryColor": "#FF6B35",
        "secondaryColor": "#004E89",
        "accentColor": "#1F77D2",
        "logoUrl": null
      },
      "contact": {
        "phone": "+212 6 12 34 56 78",
        "whatsapp": "+212 6 12 34 56 78",
        "email": "hello@makintar.com"
      },
      "layout": {
        "showSampleShowcase": true,
        "hero": {
          "enabled": true,
          "badge": "Makin Hir Tacos | Mohammedia",
          "title": "Le #1 French Tacos au Maroc",
          "description": "Komponiere dein Tacos in 5 Schritten, wähle aus 15+ artisanalen Sauces und lasse unsere Chefs es grillen.",
          "cta1": { "label": "Jetzt bestellen" },
          "cta2": { "label": "Vollständige Karte ansehen" },
          "stats": [
            { "label": "Sauces artisanales", "value": "15+" },
            { "label": "Signature Supplements", "value": "10" },
            { "label": "Service livraison", "value": "24h" }
          ],
          "backgroundImage": "https://images.unsplash.com/photo-1528732263440-4d74ae930053?auto=format&fit=crop&w=1600&q=80"
        },
        "menuSection": {
          "enabled": true,
          "badge": "Carte signature",
          "title": "Die beliebtesten Tacos",
          "description": "Rezepte inspiriert vom Original, modernisiert mit Premium-Look."
        },
        "steps": {
          "enabled": true,
          "badge": "Ritual",
          "title": "Dein Tacos in 5 Schritten",
          "steps": [
            { "title": "Schritt 1", "subtitle": "Wähle deine Größe", "detail": "L (1 Viande) - XL (2) - XXL (3)" },
            { "title": "Schritt 2", "subtitle": "Wähle deine Viande", "detail": "Tenders, Steak, Escalope, Kebab, Nuggets, Cordon Bleu..." },
            { "title": "Schritt 3", "subtitle": "Selektiere die Sauce", "detail": "Barbecue, Biggy, Fromagere, Algerienne, Samourai, Curry..." },
            { "title": "Schritt 4", "subtitle": "Füge Supplements hinzu", "detail": "Cheddar, Oignons Crispy, Bacon Dinde, Oeuf..." },
            { "title": "Schritt 5", "subtitle": "Fais gratiner", "detail": "Cheddar, Mozzarella ou Chevre Miel + 10 MAD" }
          ]
        },
        "gallery": {
          "enabled": true,
          "badge": "Ambiance",
          "title": "Shots disponibles pour ta landing",
          "images": [
            "https://images.unsplash.com/photo-1528832992873-5bb5781525d6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1605433247501-698725862cea?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1576866209830-589e1bfbb87b?auto=format&fit=crop&w=1200&q=80"
          ]
        }
      }
    }
    """;

    private const string PizzaConfig = """
    {
      "brand": {
        "primaryColor": "#C1272D",
        "secondaryColor": "#FAD201",
        "accentColor": "#2D2D2D",
        "logoUrl": null
      },
      "contact": {
        "phone": "+212 6 98 76 54 32",
        "whatsapp": "+212 6 98 76 54 32",
        "email": "hello@pizzeria-roma.com"
      },
      "layout": {
        "showSampleShowcase": true,
        "hero": {
          "enabled": true,
          "badge": "Pizzeria Roma | Casablanca",
          "title": "Authentische Italienische #Pizzas",
          "description": "Handgemachte Pizzas mit original italienischen Zutaten, zubereitet in unserem Holzofen.",
          "cta1": { "label": "Pizza bestellen" },
          "cta2": { "label": "Menü ansehen" },
          "stats": [
            { "label": "Pizzas", "value": "30+" },
            { "label": "Toppings", "value": "25+" },
            { "label": "Lieferzeit", "value": "45min" }
          ],
          "backgroundImage": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1600&q=80"
        },
        "menuSection": {
          "enabled": true,
          "badge": "Specialties",
          "title": "Unsere beliebtesten Pizzas",
          "description": "Klassische und moderne Rezepte, alle mit bester Qualität zubereitet."
        },
        "steps": {
          "enabled": true,
          "badge": "Bestellprozess",
          "title": "Deine Pizza in 4 Schritten",
          "steps": [
            { "title": "Schritt 1", "subtitle": "Größe", "detail": "25cm (small) - 30cm (medium) - 35cm (large)" },
            { "title": "Schritt 2", "subtitle": "Pizza", "detail": "Klassisch oder Custom - Margherita bis Carnivora" },
            { "title": "Schritt 3", "subtitle": "Extras", "detail": "Zusätzliche Käsesorten, Gemüse, Fleisch..." },
            { "title": "Schritt 4", "subtitle": "Kasse", "detail": "Bezahlung und Lieferoption auswählen" }
          ]
        },
        "gallery": {
          "enabled": true,
          "badge": "Galerie",
          "title": "Unsere Pizzas",
          "images": [
            "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80"
          ]
        }
      }
    }
    """;
}
