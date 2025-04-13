using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampsitesController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCampsites()
    {
        var campsites = await context.Campsites
            .Include(e => e.Campground)
            .Include(e => e.CampsiteType)
            .ToListAsync();
        
        return Ok(campsites);
    }
    
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

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableCampsites([FromQuery] CampParams campParams)
    {
        var query = context.Campsites.AsQueryable();
        
        // Filter by campground ID if provided
        if (campParams.CampgroundId > 0)
            query = query.Where(e => e.CampgroundId == campParams.CampgroundId);

        // Check if the campsite is available for the given date range
        if (campParams.StartDate is not null && campParams.EndDate is not null)
            query = query.Where(e => e.Reservations != null && !e.Reservations.Any(r => 
                campParams.StartDate <= r.EndDate && r.StartDate <= campParams.EndDate));
        
        // Ensure the campground has all the selected amenities
        if (campParams.CampgroundAmenityIds().Count > 0)
            query = query.Where(cs => campParams.CampgroundAmenityIds().All(amenityId => 
                cs.Campground != null && cs.Campground.Amenities.Any(a => a.Id == amenityId)));
        
        // Ensure the campsite type is one of the selected types
        if (campParams.CampsiteTypeIds().Count > 0)
            query = query.Where(e => campParams.CampsiteTypeIds().Contains(e.CampsiteTypeId));
        
        // Include reservations for the allowed date range
        var yesterday = DateTime.Today.AddDays(-1);
        var oneYearFromToday = DateTime.Today.AddYears(1);
        query = query.Include(e => e.Reservations!.Where(r => 
            yesterday <= r.EndDate && r.StartDate <= oneYearFromToday));
        
        // Include the campground and campsite type
        query = query.Include(e => e.Campground)
            .Include(e => e.CampsiteType);
        
        return await CreatePagedResult(query, campParams.PageNumber, campParams.PageSize);
    }
}