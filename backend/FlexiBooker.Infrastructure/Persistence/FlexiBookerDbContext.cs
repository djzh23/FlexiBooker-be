using FlexiBooker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Persistence;

public sealed class FlexiBookerDbContext : DbContext
{
    public FlexiBookerDbContext(DbContextOptions<FlexiBookerDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();


    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tenant>(b =>
        {
            b.ToTable("tenants");
            b.HasKey(x => x.Id);

            b.Property(x => x.Slug).HasMaxLength(64).IsRequired();
            b.HasIndex(x => x.Slug).IsUnique();

            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.PrimaryDomain).HasMaxLength(200);

            b.Property(x => x.Timezone).HasMaxLength(64).IsRequired();
            b.Property(x => x.Currency).HasMaxLength(3).IsRequired();

            b.Property(x => x.ConfigJson).HasColumnType("jsonb").IsRequired();
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.ToTable("menu_categories");
            b.HasKey(x => x.Id);

            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.Name });

            b.Property(x => x.Name).HasMaxLength(120).IsRequired();
            b.Property(x => x.SortOrder).IsRequired();
            b.Property(x => x.IsActive).IsRequired();
        });

        modelBuilder.Entity<MenuItem>(b =>
        {
            b.ToTable("menu_items");
            b.HasKey(x => x.Id);

            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.CategoryId });

            b.Property(x => x.Name).HasMaxLength(160).IsRequired();
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.Price).HasColumnType("numeric(10,2)").IsRequired();
            b.Property(x => x.ImageUrl).HasMaxLength(500);
            b.Property(x => x.IsAvailable).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();

            b.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
