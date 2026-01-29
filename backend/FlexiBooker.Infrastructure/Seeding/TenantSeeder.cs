using FlexiBooker.Domain.Entities;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Seeding;

public static class TenantSeeder
{
    public static async Task SeedAsync(FlexiBookerDbContext db)
    {
        if (await db.Tenants.AnyAsync()) return;

        var tenant = new Tenant("marios", "Mario's Pizza", primaryDomain: null);
        tenant.UpdateConfig("""
        {
          "brand": {
            "primaryColor": "#6D28D9",
            "accentColor": "#A78BFA",
            "logoUrl": null
          },
          "contact": {
            "whatsapp": "+49123456789",
            "phone": "+49123456789"
          }
        }
        """);

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();
    }
}
