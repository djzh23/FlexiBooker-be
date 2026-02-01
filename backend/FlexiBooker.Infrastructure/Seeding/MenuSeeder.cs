using System.Collections.Generic;
using System.Linq;
using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Seeding;

public static class MenuSeeder
{
    public static async Task SeedAsync(FlexiBookerDbContext db)
    {
        var tenantSlugs = MenuSeeds.Keys.ToArray();
        var tenants = await db.Tenants
            .Where(t => tenantSlugs.Contains(t.Slug))
            .ToListAsync();

        foreach (var tenant in tenants)
        {
            var hasAny = await db.Categories.AnyAsync(c => c.TenantId == tenant.Id);
            if (hasAny) continue;

            if (!MenuSeeds.TryGetValue(tenant.Slug, out var categoriesSeed)) continue;

            var categories = categoriesSeed
                .Select(c => new Category(tenant.Id, c.Name, c.SortOrder))
                .ToList();

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();

            var createdCategories = categories.ToDictionary(c => c.Name, c => c.Id);

            foreach (var categorySeed in categoriesSeed)
            {
                if (!createdCategories.TryGetValue(categorySeed.Name, out var categoryId))
                    continue;

                var menuItems = categorySeed.Items
                    .Select(i => new MenuItem(
                        tenant.Id,
                        categoryId,
                        i.Name,
                        i.Price,
                        i.Description,
                        i.ImageUrl,
                        i.IsAvailable))
                    .ToList();

                if (menuItems.Count > 0)
                    db.MenuItems.AddRange(menuItems);
            }

            await db.SaveChangesAsync();
        }
    }

    private sealed record MenuCategorySeed(string Name, int SortOrder, IReadOnlyList<MenuItemSeed> Items);
    private sealed record MenuItemSeed(string Name, string? Description, decimal Price, string? ImageUrl, bool IsAvailable = true);

    private static readonly IReadOnlyDictionary<string, MenuCategorySeed[]> MenuSeeds = new Dictionary<string, MenuCategorySeed[]>
    {
        ["tacos-mohammedia"] = new[]
        {
            new MenuCategorySeed(
                "Tacos",
                1,
                new[]
                {
                    new MenuItemSeed("Tacos Cordon Bleu", "Cordon bleu croustillant, fromage gratine et sauce andalouse maison.", 55m, "https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Tacos Chevre Miel", "Chevre fondant, touche de miel du Rif et noix torrefiees.", 55m, "https://images.unsplash.com/photo-1608039829743-23a84527b39b?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Tacos 3 Fromages", "Mozza, cheddar et emmental enveloppes dans une tortilla XL.", 54m, "https://images.unsplash.com/photo-1612874472202-0f535f04c9f0?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Tacos Shawarma ou Tenders", "Poulet marie facon shawarma ou tenders croustillants.", 53m, "https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Tacos Poulet ou Viande Hachee", "Classique de la maison, salsa rouge et frites maison.", 44m, "https://images.unsplash.com/photo-1612197594794-9526bfea1a6a?auto=format&fit=crop&w=1200&q=80")
                }),
            new MenuCategorySeed(
                "Drinks",
                2,
                new[]
                {
                    new MenuItemSeed("Fresh Orange Juice", "100% fresh squeezed orange juice", 25m, null),
                    new MenuItemSeed("Coca Cola", "Classic Coca Cola 33cl", 15m, null),
                    new MenuItemSeed("Water", "Bottled mineral water", 5m, null),
                    new MenuItemSeed("Sprite", "Sprite 33cl", 15m, null)
                }),
            new MenuCategorySeed(
                "Desserts",
                3,
                new[]
                {
                    new MenuItemSeed("Chocolate Cake", "Rich chocolate cake with ice cream", 40m, null),
                    new MenuItemSeed("Tiramisu", "Classic Italian Tiramisu", 35m, null)
                })
        },
        ["pizzeria-roma"] = new[]
        {
            new MenuCategorySeed(
                "Pizzas",
                1,
                new[]
                {
                    new MenuItemSeed("Margherita", "Tomato, Fresh Mozzarella, Basil, Olive Oil", 80m, "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Pepperoni", "Tomato, Mozzarella, Italian Pepperoni", 90m, "https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Four Cheese", "Mozzarella, Parmesan, Gorgonzola, Ricotta", 100m, "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80"),
                    new MenuItemSeed("Vegetarian", "Tomato, Mozzarella, Vegetables (Bell Pepper, Onion, Mushroom)", 85m, null),
                    new MenuItemSeed("Carnivora", "Tomato, Mozzarella, Prosciutto, Bacon, Sausage", 110m, null)
                }),
            new MenuCategorySeed(
                "Pasta",
                2,
                new[]
                {
                    new MenuItemSeed("Spaghetti Carbonara", "Classic Italian pasta with bacon and cream", 75m, null),
                    new MenuItemSeed("Penne Arrabbiata", "Spicy tomato sauce with garlic and chili", 70m, null),
                    new MenuItemSeed("Lasagna", "Layered pasta with meat sauce and cheese", 90m, null)
                }),
            new MenuCategorySeed(
                "Drinks",
                3,
                new[]
                {
                    new MenuItemSeed("Red Wine (Glass)", "Italian Red Wine", 50m, null),
                    new MenuItemSeed("White Wine (Glass)", "Italian White Wine", 45m, null),
                    new MenuItemSeed("Coca Cola", "Coca Cola 33cl", 15m, null),
                    new MenuItemSeed("Sparkling Water", "San Pellegrino", 20m, null)
                }),
            new MenuCategorySeed(
                "Desserts",
                4,
                new[]
                {
                    new MenuItemSeed("Panna Cotta", "Italian cream dessert with berry sauce", 40m, null),
                    new MenuItemSeed("Tiramisu", "Classic Italian Tiramisu", 45m, null),
                    new MenuItemSeed("Gelato", "Italian ice cream (3 scoops)", 30m, null)
                })
        }
    };
}

