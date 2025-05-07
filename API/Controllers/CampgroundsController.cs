using API.Attributes;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampgroundsController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCampgrounds([FromQuery] CampParams campParams)
    {
        var query = context.Campgrounds.AsQueryable();
        
        if (campParams.CampgroundAmenityIds().Count > 0)
            query = query.Where(c => campParams.CampgroundAmenityIds().All(id => 
                c.Amenities.Any(a => a.Id == id)));

        if (campParams.CampsiteTypeIds().Count > 0)
            query = query.Where(c => c.Campsites.Any(cs => 
                campParams.CampsiteTypeIds().Contains(cs.CampsiteTypeId)));
        
        if (!string.IsNullOrWhiteSpace(campParams.Search))
            query = query.Where(e => e.Name.Contains(campParams.Search));

        query = query.Include(e => e.Amenities)
            .Include(e => e.Campsites)
            .ThenInclude(e => e.CampsiteType)
            .OrderBy(e => e.Name);
        
        return await CreatePagedResult(query, campParams.PageNumber, campParams.PageSize);
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCampground(int id)
    {
        var campground = await context.Campgrounds
            .Include(e => e.Amenities)
            .Include(e => e.Campsites)
            .ThenInclude(e => e.CampsiteType)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (campground is null)
            return NotFound();
        
        return Ok(campground);
    }
}