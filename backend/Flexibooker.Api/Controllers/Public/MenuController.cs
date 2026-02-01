using FlexiBooker.Api.Contracts.Public;
using FlexiBooker.Application.Tenancy;
using FlexiBooker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlexiBooker.Api.Controllers.Public;

[ApiController]
[Route("api/v1/public/menu")]
public sealed class MenuController : ControllerBase
{
    private readonly ITenantContext _tenant;
    private readonly MenuSnapshotBuilder _menuSnapshot;

    public MenuController(ITenantContext tenant, MenuSnapshotBuilder menuSnapshot)
    {
        _tenant = tenant;
        _menuSnapshot = menuSnapshot;
    }

    [HttpGet]
    public async Task<ActionResult<MenuResponse>> Get(CancellationToken cancellationToken)
    {
        var categories = await _menuSnapshot.BuildAsync(_tenant.TenantId, cancellationToken);
        return Ok(new MenuResponse(categories));
    }
}
