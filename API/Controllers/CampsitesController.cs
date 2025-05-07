using API.Attributes;
using API.DTOs;
using Core.Interfaces;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CampsitesController(CampContext context, ICartService cartService) : BaseApiController
{
    [Cache((int)TimeSpan.SecondsPerDay * 7)]
    [HttpGet]
    public async Task<IActionResult> GetCampsites()
    {
        var campsites = await context.Campsites
            .Include(e => e.Campground)
            .Include(e => e.CampsiteType)
            .ToListAsync();
        
        return Ok(campsites);
    }
    
    [Cache((int)TimeSpan.SecondsPerDay * 7)]
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
        var pendingReservations = (await cartService.GetAllPendingReservations()).ToList();
        
        // Filter by campground ID if provided
        if (campParams.CampgroundId > 0)
            query = query.Where(e => e.CampgroundId == campParams.CampgroundId);

        // Check if the campsite is available for the given date range
        if (campParams.StartDate is not null && campParams.EndDate is not null)
        {
            // Exclude campsites with existing reservations
            query = query.Where(e => e.Reservations != null && !e.Reservations.Any(r => 
                campParams.StartDate <= r.EndDate && r.StartDate <= campParams.EndDate));
            
            // Exclude campsites with conflicting pending reservations
            var campsitesWithConflictingPendingReservations = pendingReservations
                .Where(r => campParams.StartDate <= r.EndDate
                            && r.StartDate <= campParams.EndDate)
                .Select(r => r.CampsiteId);
            query = query.Where(e => !campsitesWithConflictingPendingReservations.Contains(e.Id));
        }
        
        // Ensure the campground has all the selected amenities
        if (campParams.CampgroundAmenityIds().Count > 0)
            query = query.Where(cs => campParams.CampgroundAmenityIds().All(amenityId => 
                cs.Campground != null && cs.Campground.Amenities.Any(a => a.Id == amenityId)));
        
        // Ensure the campsite type is one of the selected types
        if (campParams.CampsiteTypeIds().Count > 0)
            query = query.Where(e => campParams.CampsiteTypeIds().Contains(e.CampsiteTypeId));
        
        // Include reservations for the allowed date range
        var yesterday = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));
        var oneYearFromToday = DateOnly.FromDateTime(DateTime.Today.AddYears(1));
        query = query.Include(e => e.Reservations!.Where(r => 
            yesterday <= r.EndDate && r.StartDate <= oneYearFromToday));
        
        // Include the campground and campsite type
        query = query.Include(e => e.Campground)
            .Include(e => e.CampsiteType);
        
        // Get the paged results to convert to DTOs
        var pagedCampsiteData = await GetPagedData(query, campParams.PageNumber, campParams.PageSize);
        
        // Map the results to DTOs
        var campsiteAvailabilityDtoList = pagedCampsiteData.Data.Select(campsite => new CampsiteAvailabilityDto
            {
                Id = campsite.Id,
                Name = campsite.Name,
                Description = campsite.Description,
                CampgroundId = campsite.CampgroundId,
                CampgroundName = campsite.Campground?.Name ?? string.Empty,
                CampsiteTypeId = campsite.CampsiteTypeId,
                CampsiteTypeName = campsite.CampsiteType?.Name ?? string.Empty,
                WeekDayPrice = campsite.CampsiteType?.WeekDayPrice,
                WeekEndPrice = campsite.CampsiteType?.WeekEndPrice,
                Reservations = campsite.Reservations?.Select(r => new ReservationDto
                {
                    Id = r.Id, 
                    CampsiteId = r.CampsiteId,
                    StartDate = r.StartDate, 
                    EndDate = r.EndDate
                }).ToList() ?? [],
                PendingReservations = pendingReservations.Where(r => r.CampsiteId == campsite.Id)
                    .Select(r => new PendingReservationDto
                    {
                        CampsiteId = r.CampsiteId,
                        StartDate = r.StartDate, 
                        EndDate = r.EndDate
                    })
                    .ToList()
            })
            .ToList();

        // Create the paged result
        var pagedCampsiteAvailabilityDtoList = new PagedResult<CampsiteAvailabilityDto>(
            pagedCampsiteData.PageNumber,
            pagedCampsiteData.PageSize, 
            pagedCampsiteData.Count, 
            campsiteAvailabilityDtoList);

        return Ok(pagedCampsiteAvailabilityDtoList);
    }
}