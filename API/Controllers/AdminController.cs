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

        var percentTentSitesOccupied = 0;
        var percentRvSitesOccupied = 0;
        var percentCabinsOccupied = 0;
        
        if (totalTentSites > 0)
        {
            percentTentSitesOccupied = (int)((double)reservationsToday.Count(x => x.Campsite.CampsiteType.Id == 1) / totalTentSites * 100);
        }
        
        if (totalRvSites > 0)
        {
            percentRvSitesOccupied = (int)((double)reservationsToday.Count(x => x.Campsite.CampsiteType.Id == 2) / totalRvSites * 100);
        }
        
        if (totalCabins > 0)
        {
            percentCabinsOccupied = (int)((double)reservationsToday.Count(x => x.Campsite.CampsiteType.Id == 3) / totalCabins * 100);
        }
        
        var occupancy = new
        {
            TotalTentSites = totalTentSites,
            TotalRvSites = totalRvSites,
            TotalCabins = totalCabins,
            PercentTentSitesOccupied = percentTentSitesOccupied,
            PercentRvSitesOccupied = percentRvSitesOccupied,
            PercentCabinsOccupied = percentCabinsOccupied
        };
        
        return Ok(occupancy);
    }
}