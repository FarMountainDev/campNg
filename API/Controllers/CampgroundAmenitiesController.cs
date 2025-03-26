using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampgroundAmenitiesController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCampgroundAmenities()
    {
        var campgroundAmenities = await context.CampgroundAmenities.ToListAsync();
        return Ok(campgroundAmenities);
    }
}