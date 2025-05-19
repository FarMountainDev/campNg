using API.Attributes;
using API.DTOs;
using API.Extensions;
using Core.Entities.OrderAggregate;
using Core.Enums;
using Core.Interfaces;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(CampContext context, IPaymentService paymentService) : BaseApiController
{
    [Cache((int)TimeSpan.SecondsPerDay * 7)]
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery]OrderParams orderParams)
    {
        var query = context.Orders.AsQueryable();
        
        if (orderParams.Status != null && Enum.TryParse<OrderStatus>(orderParams.Status, true, out var orderStatus))
        {
            query = query.Where(o => o.Status == orderStatus);
        }

        query = query.Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered);
        
        query = query.OrderByDescending(o => o.OrderDate);
        
        return await CreatePagedResult(query, orderParams.PageNumber, orderParams.PageSize, o => o.ToDto());
    }
    
    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .FirstOrDefaultAsync(x => x.Id == id);
        
        if (order == null) return NotFound();
        
        return order.ToDto();
    }

    [HttpPost("orders/refund/{id:int}")]
    public async Task<ActionResult<OrderDto>> RefundOrder(int id)
    {
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null) return BadRequest("No order with that id");
        
        if (order.Status == OrderStatus.Pending)
            return BadRequest("Cannot refund an order that is pending payment");

        var result = await paymentService.RefundPayment(order.PaymentIntentId);
        
        if (result == "succeeded")
        {
            order.Status = OrderStatus.Refunded;

            await context.SaveChangesAsync();

            return order.ToDto();
        }
        
        return BadRequest("Problem refunding order");
    }

    [HttpGet("check-ins")]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetCheckInsForToday([FromQuery]BaseParams baseParams)
    {
        var today = DateOnly.FromDateTime(DateTime.Now.Date); // TODO converting UTC to DateOnly creates issues with timezones
        
        var query = context.Reservations
            .Include(x => x.Campsite)
            .Where(x => x.StartDate == today);
        
        return await CreatePagedResult(query, baseParams.PageNumber, baseParams.PageSize, r => r.ToDto());
    }
    
    [HttpGet("check-outs")]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetCheckOutsForToday([FromQuery]BaseParams baseParams)
    {
        var today = DateOnly.FromDateTime(DateTime.Now.Date);
        
        var query = context.Reservations
            .Include(x => x.Campsite)
            .Where(x => x.EndDate.AddDays(1) == today);
        
        return await CreatePagedResult(query, baseParams.PageNumber, baseParams.PageSize, r => r.ToDto());
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

    [HttpGet("revenue")]
    public async Task<ActionResult> GetMonthlyRevenue()
    {
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

        // Create a dictionary to store revenue by month and campground
        var revenueData = new Dictionary<string, Dictionary<string, decimal>>();

        // Create month list for the timeframe
        var months = new List<string>();
        for (int i = -5; i <= 6; i++)
        {
            var month = new DateTime(currentYear, currentMonth, 1).AddMonths(i);
            months.Add(month.ToString("MM/yyyy"));
        }
        
        // Get all campgrounds
        var campgrounds = await context.Campgrounds
            .ToListAsync();

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

                var orderMonth = order.OrderDate.ToString("MM/yyyy");
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