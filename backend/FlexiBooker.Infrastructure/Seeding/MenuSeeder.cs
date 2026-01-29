using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Seeding;

public static class MenuSeeder
{
    public static async Task SeedAsync(FlexiBookerDbContext db)
    {
        // We seed only if tenant exists and no categories yet
        var tenant = await db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Slug == "marios");
        if (tenant is null) return;

        var hasAny = await db.Categories.AnyAsync(c => c.TenantId == tenant.Id);
        if (hasAny) return;

        var pizzas = new Category(tenant.Id, "Pizza", sortOrder: 1);
        var pasta = new Category(tenant.Id, "Pasta", sortOrder: 2);
        var drinks = new Category(tenant.Id, "Getränke", sortOrder: 3);

        db.Categories.AddRange(pizzas, pasta, drinks);
        await db.SaveChangesAsync();

        db.MenuItems.AddRange(
            new MenuItem(tenant.Id, pizzas.Id, "Margherita", 8.90m, "Tomatensauce, Mozzarella, Basilikum"),
            new MenuItem(tenant.Id, pizzas.Id, "Salami", 10.50m, "Tomatensauce, Mozzarella, Salami"),
            new MenuItem(tenant.Id, pasta.Id, "Spaghetti Bolognese", 11.90m, "Rind, Tomate, Parmesan"),
            new MenuItem(tenant.Id, drinks.Id, "Cola 0.33L", 2.50m),
            new MenuItem(tenant.Id, drinks.Id, "Wasser 0.5L", 2.00m)
        );

        await db.SaveChangesAsync();
    }
}
