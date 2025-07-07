using API.Attributes;
using API.Extensions;
using Core.Parameters;
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
            .Include(a => a.Campgrounds)
            .InDisplayOrder()
            .ToListAsync();

        return Ok(announcements);
    }
    
    [Cache((int)TimeSpan.SecondsPerDay * 30)]
    [HttpGet("campground")]
    public async Task<IActionResult> GetCampgroundAnnouncements([FromQuery] AnnouncementParams announcementParams)
    {
        var announcements = await context.Announcements
            .WhereActive()
            .Where(a => a.Campgrounds.Any(c => announcementParams.CampgroundIds().Contains(c.Id)))
            .Distinct()
            .Include(a => a.Campgrounds)
            .InDisplayOrder()
            .ToListAsync();

        return Ok(announcements);
    }
}