using Core.Entities;
using Core.Specifications;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampgroundsController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetCampgrounds([FromQuery] CampgroundParams campgroundParams)
    {
        var query = context.Campgrounds.AsQueryable();
        
        if (campgroundParams.HasHiking is not null && campgroundParams.HasHiking == true)
            query = query.Where(e => e.HasHiking);
        
        if (campgroundParams.HasSwimming is not null && campgroundParams.HasSwimming == true)
            query = query.Where(e => e.HasSwimming);
        
        if (campgroundParams.HasFishing is not null && campgroundParams.HasFishing == true)
            query = query.Where(e => e.HasFishing);
        
        if (campgroundParams.HasShowers is not null && campgroundParams.HasShowers == true)
            query = query.Where(e => e.HasShowers);
        
        if (campgroundParams.HasBoatRentals is not null && campgroundParams.HasBoatRentals == true)
            query = query.Where(e => e.HasBoatRentals);
        
        if (campgroundParams.HasStore is not null && campgroundParams.HasStore == true)
            query = query.Where(e => e.HasStore);
        
        if (campgroundParams.HasWifi is not null && campgroundParams.HasWifi == true)
            query = query.Where(e => e.HasWifi);
        
        if (campgroundParams.AllowsPets is not null && campgroundParams.AllowsPets == true)
            query = query.Where(e => e.AllowsPets);

        if (campgroundParams.CampsiteTypeIds().Count > 0)
            query = query.Where(c => c.Campsites.Any(cs => 
                campgroundParams.CampsiteTypeIds().Contains(cs.CampsiteTypeId)));
        
        if (!string.IsNullOrWhiteSpace(campgroundParams.Search))
            query = query.Where(e => e.Name.Contains(campgroundParams.Search));
        
        query = query.Include(e => e.Campsites)
            .ThenInclude(e => e.CampsiteType);
        
        return await CreatePagedResult(query, campgroundParams.PageNumber, campgroundParams.PageSize);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCampground(int id)
    {
        var campground = await context.Campgrounds
            .Include(e => e.Campsites)
            .ThenInclude(e => e.CampsiteType)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (campground is null)
            return NotFound();
        
        return Ok(campground);
    }
}