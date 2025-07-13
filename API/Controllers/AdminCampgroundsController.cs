using API.DTOs;
using API.Extensions;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/campgrounds")]
public class AdminCampgroundsController(CampContext context) : BaseApiController
{
    [HttpGet]
    [Route("select-options")]
    public async Task<ActionResult<IReadOnlyList<CampgroundDto>>> GetCampgroundSelectOptions()
    {
        var campgrounds = await context.Campgrounds
            .ToListAsync();

        return Ok(campgrounds.Select(c => c.ToDto()).ToList());
    }
}