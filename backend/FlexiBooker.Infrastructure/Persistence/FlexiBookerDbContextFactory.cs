using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FlexiBooker.Infrastructure.Persistence;

public sealed class FlexiBookerDbContextFactory
    : IDesignTimeDbContextFactory<FlexiBookerDbContext>
{
    public FlexiBookerDbContext CreateDbContext(string[] args)
    {
        // Priority:
        // 1) Env var FLEXIBOOKER_CONNECTION
        // 2) Default local docker postgres connection
        var cs =
            Environment.GetEnvironmentVariable("FLEXIBOOKER_CONNECTION")
            ?? "Host=localhost;Port=5432;Database=flexibooker;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<FlexiBookerDbContext>()
            .UseNpgsql(cs)
            .Options;

        return new FlexiBookerDbContext(options);
    }
}
