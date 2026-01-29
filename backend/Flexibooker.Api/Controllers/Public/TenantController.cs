using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Application.Tenancy;
using FlexiBooker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlexiBooker.Api.Controllers.Public;

[ApiController]
[Route("api/v1/public/tenant")]
public sealed class TenantController : ControllerBase
{
    private readonly ITenantContext _tenant;
    private readonly FlexiBookerDbContext _db;

    public TenantController(ITenantContext tenant, FlexiBookerDbContext db)
    {
        _tenant = tenant;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<TenantResponse>> Get()
    {
        var t = await _db.Tenants.AsNoTracking()
            .FirstAsync(x => x.Id == _tenant.TenantId);

        return Ok(new TenantResponse(
            t.Slug,
            t.Name,
            t.Timezone,
            t.Currency,
            t.ConfigJson
        ));
    }
}
