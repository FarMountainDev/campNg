using API.Attributes;
using API.DTOs;
using API.Extensions;
using Core.Enums;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController(CampContext context) : BaseApiController
{
    
    [HttpGet("check-ins")]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetCheckInsForToday([FromQuery]BaseParams baseParams)
    {
        var today = DateOnly.FromDateTime(DateTime.Now.Date); // TODO converting UTC to DateOnly creates issues with timezones
        
        var query = context.Reservations
            .Include(x => x.Campsite)
            .Include(x => x.OrderItem)
            .ThenInclude(x => x!.Order)
            .Where(x => x.StartDate == today);
        
        return await CreatePagedResult(query, baseParams.PageNumber, baseParams.PageSize, r => r.ToDto(true));
    }
    
    [HttpGet("check-outs")]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetCheckOutsForToday([FromQuery]BaseParams baseParams)
    {
        var today = DateOnly.FromDateTime(DateTime.Now.Date);
        
        var query = context.Reservations
            .Include(x => x.Campsite)
            .Include(x => x.OrderItem)
            .ThenInclude(x => x!.Order)
            .Where(x => x.EndDate.AddDays(1) == today);
        
        return await CreatePagedResult(query, baseParams.PageNumber, baseParams.PageSize, r => r.ToDto(true));
    }

    [HttpGet("occupancy")]
    public async Task<ActionResult> GetOccupancyForToday()
    {
        var today = DateOnly.FromDateTime(DateTime.Now.Date);

        var reservationsToday = await context.Reservations
            .Include(x => x.Campsite)
            .ThenInclude(x => x!.CampsiteType)
            .Where(x => x.StartDate <= today && x.EndDate >= today)
            .ToListAsync();

        var totalTentSites = await context.Campsites
            .CountAsync(x => x.CampsiteType != null && x.CampsiteType.Id == 1);
        var totalRvSites = await context.Campsites
            .CountAsync(x => x.CampsiteType != null && x.CampsiteType.Id == 2);
        var totalCabins = await context.Campsites
            .CountAsync(x => x.CampsiteType != null && x.CampsiteType.Id == 3);

        var tentSitesOccupied = 0;
        var rvSitesOccupied = 0;
        var cabinsOccupied = 0;
        var percentTentSitesOccupied = 0;
        var percentRvSitesOccupied = 0;
        var percentCabinsOccupied = 0;
        
        if (totalTentSites > 0)
        {
            tentSitesOccupied = reservationsToday.Count(x => x.Campsite!.CampsiteType!.Id == 1);
            percentTentSitesOccupied = (int)((double)tentSitesOccupied / totalTentSites * 100);
        }
        
        if (totalRvSites > 0)
        {
            rvSitesOccupied = reservationsToday.Count(x => x.Campsite!.CampsiteType!.Id == 2);
            percentRvSitesOccupied = (int)((double)rvSitesOccupied / totalRvSites * 100);
        }
        
        if (totalCabins > 0)
        {
            cabinsOccupied = reservationsToday.Count(x => x.Campsite!.CampsiteType!.Id == 3);
            percentCabinsOccupied = (int)((double)cabinsOccupied / totalCabins * 100);
        }

        var occupancyRates = new List<OccupancyRate>
        {
            new()
            {
                Label = "Tent Sites",
                Total = totalTentSites,
                Occupied = tentSitesOccupied,
                Percentage = percentTentSitesOccupied
            },
            new()
            {
                Label = "RV Sites",
                Total = totalRvSites,
                Occupied = rvSitesOccupied,
                Percentage = percentRvSitesOccupied
            },
            new()
            {
                Label = "Cabins",
                Total = totalCabins,
                Occupied = cabinsOccupied,
                Percentage = percentCabinsOccupied
            }
        };
        
        return Ok(occupancyRates);
    }

    [Cache((int)TimeSpan.SecondsPerDay)]
    [HttpGet("revenue")]
    public async Task<ActionResult> GetMonthlyRevenue()
    {
        const string monthFormat = "MM/yyyy";
        var currentMonth = DateTime.Now.Month;
        var currentYear = DateTime.Now.Year;

        // Get all orders from 5 months ago until 6 months from now
        var firstDayOfTheMonthFiveMonthsAgo = new DateTime(currentYear, currentMonth, 1).AddMonths(-5);
        var lastDayOfTheMonthSixMonthsFromNow = new DateTime(currentYear, currentMonth, 1).AddMonths(7).AddDays(-1);

        var orders = await context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Reservation)
                    .ThenInclude(r => r!.Campsite)
                        .ThenInclude(c => c!.Campground)
            .Where(o => o.OrderDate >= firstDayOfTheMonthFiveMonthsAgo && 
                        o.OrderDate <= lastDayOfTheMonthSixMonthsFromNow && 
                        o.Status != OrderStatus.Refunded)
            .ToListAsync();

        // Get list of campgrounds and initialize revenue data
        var campgrounds = await context.Campgrounds
            .ToListAsync();
        var revenueData = new Dictionary<string, Dictionary<string, decimal>>();

        // Create a month list for the timeframe
        var months = new List<string>();
        for (int i = -5; i <= 6; i++)
        {
            var month = new DateTime(currentYear, currentMonth, 1).AddMonths(i);
            months.Add(month.ToString(monthFormat));
        }
        
        // Initialize all campgrounds with zero revenue for each month
        foreach (var campground in campgrounds)
        {
            foreach (var month in months)
            {
                if (!revenueData.ContainsKey(month))
                    revenueData[month] = new Dictionary<string, decimal>();
                
                revenueData[month][campground.Name] = 0;
            }
        }

        // Calculate revenue for each month and campground
        foreach (var order in orders)
        {
            foreach (var item in order.OrderItems)
            {
                if (item.Reservation?.Campsite?.Campground == null) continue;

                var orderMonth = order.OrderDate.ToString(monthFormat);
                var campgroundName = item.Reservation.Campsite.Campground.Name;

                if (revenueData.ContainsKey(orderMonth) && revenueData[orderMonth].ContainsKey(campgroundName))
                {
                    revenueData[orderMonth][campgroundName] += item.Price;
                }
            }
        }

        // Transform data to a format suitable for charts
        var result = new
        {
            Months = months,
            Datasets = campgrounds.Select(c => new
            {
                Campground = c.Name,
                Revenue = months.Select(m => revenueData[m].GetValueOrDefault(c.Name, 0)).ToList()
            }).ToList()
        };

        return Ok(result);
    }
}