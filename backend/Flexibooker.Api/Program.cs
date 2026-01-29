using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using FlexiBooker.Api.Middleware;
using FlexiBooker.Application.Tenancy;
using FlexiBooker.Infrastructure.Persistence;
using FlexiBooker.Infrastructure.Seeding;
using FlexiBooker.Infrastructure.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();

builder.Services.AddDbContext<FlexiBookerDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseNpgsql(cs);
});

builder.Services
    .AddApiVersioning(o =>
    {
        o.DefaultApiVersion = new ApiVersion(1, 0);
        o.AssumeDefaultVersionWhenUnspecified = true;
        o.ReportApiVersions = true;
        o.ApiVersionReader = new UrlSegmentApiVersionReader();
    })
    .AddMvc()
    .AddApiExplorer(o =>
    {
        o.GroupNameFormat = "'v'VVV";
        o.SubstituteApiVersionInUrl = true;
    });

builder.Services.AddSwaggerGen();
builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();





builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());
builder.Services.AddScoped<TenantResolutionMiddleware>();





var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FlexiBookerDbContext>();
    await db.Database.MigrateAsync();
    await TenantSeeder.SeedAsync(db);
    await MenuSeeder.SeedAsync(db);

}

// HTTP Pipeline configuration
if (app.Environment.IsDevelopment())
{
    // [v1, v2, v3, ...]
    var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

    app.UseSwagger();
    app.UseSwaggerUI(o =>
    {
        foreach (var desc in provider.ApiVersionDescriptions)
        {
            o.SwaggerEndpoint($"/swagger/{desc.GroupName}/swagger.json", $"FlexiBooker {desc.GroupName}");
        }
        o.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseMiddleware<TenantResolutionMiddleware>();
app.MapControllers();
app.Run();

public sealed class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;
    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) => _provider = provider;

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var desc in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(desc.GroupName, new OpenApiInfo
            {
                Title = "FlexiBooker API",
                Version = desc.ApiVersion.ToString()
            });
        }
    }
}
