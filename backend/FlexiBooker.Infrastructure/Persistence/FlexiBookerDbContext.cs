using FlexiBooker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Infrastructure.Persistence;

public sealed class FlexiBookerDbContext : DbContext
{
    public FlexiBookerDbContext(DbContextOptions<FlexiBookerDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();

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
    }
}
