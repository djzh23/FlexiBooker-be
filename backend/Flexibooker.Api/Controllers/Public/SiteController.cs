using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Api.Services;
using FlexiBooker.Application.Tenancy;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Api.Controllers.Public;

[ApiController]
[Route("api/v1/public/site")]
public sealed class SiteController : ControllerBase
{
    private readonly ITenantContext _tenant;
    private readonly FlexiBookerDbContext _db;
    private readonly MenuSnapshotBuilder _menuSnapshot;

    public SiteController(ITenantContext tenant, FlexiBookerDbContext db, MenuSnapshotBuilder menuSnapshot)
    {
        _tenant = tenant;
        _db = db;
        _menuSnapshot = menuSnapshot;
    }

    [HttpGet]
    public async Task<ActionResult<SiteResponse>> Get(CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants.AsNoTracking()
            .FirstAsync(t => t.Id == _tenant.TenantId, cancellationToken);

        var tenantResponse = new TenantResponse(
            tenant.Slug,
            tenant.Name,
            tenant.Timezone,
            tenant.Currency,
            tenant.ConfigJson);

        var categories = await _menuSnapshot.BuildAsync(_tenant.TenantId, cancellationToken);

        return Ok(new SiteResponse(tenantResponse, categories));
    }
}
