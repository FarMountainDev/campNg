using API.Attributes;
using API.Extensions;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AnnouncementsController(CampContext context) : BaseApiController
{
    [Cache((int)TimeSpan.SecondsPerDay * 30)]
    public async Task<IActionResult> GetGlobalAnnouncements()
    {
        var announcements = await context.Announcements
            .WhereActive()
            .Where(a => a.ForceGlobal || !a.Campgrounds.Any()) // Global announcements have no associated campgrounds
            .InDisplayOrder()
            .Include(a => a.Campgrounds)
            .ToListAsync();

        return Ok(announcements);
    }
    
    [Cache((int)TimeSpan.SecondsPerDay * 30)]
    [HttpGet("campgrounds")]
    public async Task<IActionResult> GetCampgroundAnnouncements([FromQuery] int[] campgroundIds)
    {
        var announcements = await context.Announcements
            .WhereActive()
            .Where(a => a.Campgrounds.Any(c => campgroundIds.Contains(c.Id)))
            .InDisplayOrder()
            .Distinct()
            .Include(a => a.Campgrounds)
            .ToListAsync();

        return Ok(announcements);
    }
}