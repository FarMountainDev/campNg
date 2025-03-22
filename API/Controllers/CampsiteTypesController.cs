using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampsiteTypesController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCampsiteTypes()
    {
        var campsiteTypes = await context.CampsiteTypes.ToListAsync();
        return Ok(campsiteTypes);
    }
}