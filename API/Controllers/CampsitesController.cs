using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampsitesController(CampContext context) : BaseApiController
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCampsite(int id)
    {
        var campsite = await context.Campsites
            .Include(e => e.Campground)
            .Include(e => e.CampsiteType)
            .Include(e => e.Reservations)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (campsite is null)
            return NotFound();
        
        return Ok(campsite);
    }
}