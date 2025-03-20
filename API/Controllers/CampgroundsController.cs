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
        
        if (!string.IsNullOrEmpty(campgroundParams.Sort))
        {
            query = campgroundParams.Sort switch
            {
                "name" => query.OrderBy(e => e.Name),
                "nameDesc" => query.OrderByDescending(e => e.Name),
                _ => query.OrderBy(e => e.Name)
            };
        }
        
        if (campgroundParams.HasHiking is not null && campgroundParams.HasHiking == true)
            query = query.Where(e => e.HasHiking);
        
        if (campgroundParams.HasSwimming is not null && campgroundParams.HasSwimming == true)
            query = query.Where(e => e.HasSwimming);
        
        if (campgroundParams.HasFishing is not null && campgroundParams.HasFishing == true)
            query = query.Where(e => e.HasFishing);
        
        if (campgroundParams.HasBoatRentals is not null && campgroundParams.HasBoatRentals == true)
            query = query.Where(e => e.HasBoatRentals);
        
        if (campgroundParams.HasStore is not null && campgroundParams.HasStore == true)
            query = query.Where(e => e.HasStore);
        
        if (campgroundParams.HasShowers is not null && campgroundParams.HasShowers == true)
            query = query.Where(e => e.HasShowers);
        
        if (campgroundParams.HasWifi is not null && campgroundParams.HasWifi == true)
            query = query.Where(e => e.HasWifi);
        
        if (campgroundParams.AllowsPets is not null && campgroundParams.AllowsPets == true)
            query = query.Where(e => e.AllowsPets);

        if (campgroundParams.CampsiteTypeIds().Count > 0)
        {
            query = query.Where(c => c.Campsites.Any(cs => 
                campgroundParams.CampsiteTypeIds().Contains(cs.CampsiteTypeId)));
        }
        
        query = query.Include(e => e.Campsites)
            .ThenInclude(e => e.CampsiteType);
        
        // var campgrounds = await context.Campgrounds
        //     .Include(c => c.Campsites)
        //     .ThenInclude(c => c.CampsiteType)
        //     .ToListAsync();

        return await CreatePagedResult(context, query, campgroundParams.PageNumber, campgroundParams.PageSize);
    }
}