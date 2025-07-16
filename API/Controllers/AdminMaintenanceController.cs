using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/maintenance")]
public class AdminMaintenanceController(IResponseCacheService cacheService) : BaseApiController
{
    [HttpDelete("clear-cache")]
    public async Task<IActionResult> ClearRedisApiCache()
    {
        await cacheService.RemoveCacheByPatternAsync("");
        return Ok();
    }
}