using API.Attributes;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Enums;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/announcements")]
public class AdminAnnouncementsController(CampContext context, UserManager<AppUser> userManager) : BaseApiController
{
    //[Cache((int)TimeSpan.SecondsPerDay * 30)]
    [HttpGet]
    public async Task<IActionResult> GetAnnouncements([FromQuery] AnnouncementParams announcementParams)
    {
        var query = context.Announcements.AsQueryable();

        query = query.Include(a => a.Campgrounds)
            .Include(a => a.CreatedBy)
            .Include(a => a.UpdatedBy);
        
        if (announcementParams.CampgroundIds().Any())
            query = query.Where(a => a.Campgrounds.Any(c => announcementParams.CampgroundIds().Contains(c.Id)));
        
        if (!string.IsNullOrWhiteSpace(announcementParams.Search))
            query = query.Where(a => 
                a.Title.Contains(announcementParams.Search) || 
                a.Content.Contains(announcementParams.Search));

        if (!string.IsNullOrEmpty(announcementParams.Sort))
        {
            var sortField = announcementParams.Sort.ToLower();
            var isDescending = announcementParams.SortDirection?.ToLower() == "desc";
            
            query = sortField switch
            {
                "id" => isDescending ? query.OrderByDescending(a => a.Id) : query.OrderBy(a => a.Id),
                "title" => isDescending ? query.OrderByDescending(a => a.Title) : query.OrderBy(a => a.Title),
                "expirationdate" => isDescending ? query.OrderByDescending(a => a.ExpirationDate) : query.OrderBy(a => a.ExpirationDate),
                "pinnedpriority" => isDescending ? query.OrderByDescending(a => a.PinnedPriority) : query.OrderBy(a => a.PinnedPriority),
                "createdat" => isDescending ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
                "updatedat" => isDescending ? query.OrderByDescending(a => a.UpdatedAt) : query.OrderBy(a => a.UpdatedAt),
                "createdby" => isDescending 
                    ? query.OrderByDescending(a => a.CreatedBy != null ? a.CreatedBy.UserName : string.Empty) 
                    : query.OrderBy(a => a.CreatedBy != null ? a.CreatedBy.UserName : string.Empty),
                "updatedby" => isDescending 
                    ? query.OrderByDescending(a => a.UpdatedBy != null ? a.UpdatedBy.UserName : string.Empty) 
                    : query.OrderBy(a => a.UpdatedBy != null ? a.UpdatedBy.UserName : string.Empty),
                _ => query.OrderByDescending(a => a.CreatedAt)
            };
        }
        
        var announcements = await query
            .Skip((announcementParams.PageNumber - 1) * announcementParams.PageSize)
            .Take(announcementParams.PageSize)
            .ToListAsync();
        var count = await query.CountAsync();
        
        var announcementDtoList = announcements.Select(a => a.ToDto()).ToList();
        var pagination = new PagedResult<AnnouncementDto>(announcementParams.PageNumber, announcementParams.PageSize, count, announcementDtoList);

        return Ok(pagination);
    }

    [HttpPost]
    [InvalidateCache("/api/admin/announcements", "/api/announcements")]
    public async Task<IActionResult> CreateAnnouncement(CreateUpdateAnnouncementDto announcementDto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized("User not found");
        
        var announcement = new Announcement
        {
            Title = announcementDto.Title,
            Subtitle = announcementDto.Subtitle,
            Content = announcementDto.Content,
            ExpirationDate = announcementDto.ExpirationDate,
            MessageType = announcementDto.MessageType,
            ForceGlobal = announcementDto.ForceGlobal,
            PinnedPriority = announcementDto.PinnedPriority,
            CreatedBy = user
        };
    
        if (announcementDto.CampgroundIds is not null)
        {
            foreach (var campgroundId in announcementDto.CampgroundIds)
            {
                var campground = await context.Campgrounds.FindAsync(campgroundId);
                if (campground is null) return NotFound($"Campground with ID {campgroundId} not found");
                announcement.Campgrounds.Add(campground);
            }
        }
    
        context.Announcements.Add(announcement);
        await context.SaveChangesAsync();
    
        return CreatedAtAction(nameof(GetAnnouncements), new { id = announcement.Id }, announcement.ToDto());
    }

    [HttpPut("{id:int}")]
    [InvalidateCache("/api/admin/announcements", "/api/announcements")]
    public async Task<IActionResult> UpdateAnnouncement(int id, CreateUpdateAnnouncementDto announcementDto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized("User not found");
        
        var existingAnnouncement = await context.Announcements.FindAsync(id);
        if (existingAnnouncement is null) return NotFound($"Announcement with ID {id} not found");
        
        existingAnnouncement.Title = announcementDto.Title;
        existingAnnouncement.Subtitle = announcementDto.Subtitle;
        existingAnnouncement.Content = announcementDto.Content;
        existingAnnouncement.ExpirationDate = announcementDto.ExpirationDate;
        existingAnnouncement.MessageType = announcementDto.MessageType;
        existingAnnouncement.ForceGlobal = announcementDto.ForceGlobal;
        existingAnnouncement.PinnedPriority = announcementDto.PinnedPriority;
        existingAnnouncement.UpdatedBy = user;
        existingAnnouncement.UpdatedAt = DateTime.UtcNow;
        existingAnnouncement.Campgrounds.Clear();
        
        if (announcementDto.CampgroundIds is not null)
        {
            foreach (var campgroundId in announcementDto.CampgroundIds)
            {
                var campground = await context.Campgrounds.FindAsync(campgroundId);
                if (campground is null) return NotFound($"Campground with ID {campgroundId} not found");
                existingAnnouncement.Campgrounds.Add(campground);
            }
        }
        
        context.Announcements.Update(existingAnnouncement);
        await context.SaveChangesAsync();
        
        return NoContent();
    }
}