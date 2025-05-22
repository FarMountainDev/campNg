using API.Attributes;
using API.DTOs;
using API.Extensions;
using Core.Enums;
using Core.Interfaces;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/orders")]
public class AdminOrdersController(CampContext context, IPaymentService paymentService) : BaseApiController
{
    [Cache((int)TimeSpan.SecondsPerDay * 7)]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery]OrderParams orderParams)
    {
        var query = context.Orders.AsQueryable();
        
        if (orderParams.Status != null && Enum.TryParse<OrderStatus>(orderParams.Status, true, out var orderStatus))
            query = query.Where(o => o.Status == orderStatus);
        
        if (!string.IsNullOrWhiteSpace(orderParams.Search))
            query = query.Where(x => x.BuyerEmail.Contains(orderParams.Search) 
                                     || x.Id.ToString().Contains(orderParams.Search));

        query = query.Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered);
        
        if (!string.IsNullOrEmpty(orderParams.Sort))
        {
            var sortField = orderParams.Sort.ToLower();
            var isDescending = orderParams.SortDirection?.ToLower() == "desc";
    
            query = sortField switch
            {
                "id" => isDescending ? query.OrderByDescending(o => o.Id) : query.OrderBy(o => o.Id),
                "buyeremail" => isDescending ? query.OrderByDescending(o => o.BuyerEmail) : query.OrderBy(o => o.BuyerEmail),
                "orderdate" => isDescending ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate),
                "status" => isDescending ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status),
                "total" => isDescending ? query.OrderByDescending(o => o.Subtotal) : query.OrderBy(o => o.Subtotal),
                _ => isDescending ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate)
            };
        }
        else query = query.OrderByDescending(o => o.OrderDate);
        
        return await CreatePagedResult(query, orderParams.PageNumber, orderParams.PageSize, o => o.ToDto());
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .FirstOrDefaultAsync(x => x.Id == id);
        
        if (order == null) return NotFound();
        
        return order.ToDto();
    }
    
    [Authorize(Roles = "Admin")]
    [InvalidateCache("api/admin/orders", "api/admin/revenue")]
    [HttpPost("refund/{id:int}")]
    public async Task<ActionResult<OrderDto>> RefundOrder(int id)
    {
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null) return BadRequest("No order with that id");
        
        if (order.Status == OrderStatus.Pending)
            return BadRequest("Cannot refund an order that is pending payment");
        
        #if DEBUG
            // Allow refunds for seed orders in debug mode
            if (order.PaymentIntentId.Contains("pi_seed_"))
            {
                order.Status = OrderStatus.Refunded;
                await context.SaveChangesAsync();
                return order.ToDto();
            }
        #endif

        var result = await paymentService.RefundPayment(order.PaymentIntentId);
        
        if (result == "succeeded")
        {
            order.Status = OrderStatus.Refunded;

            await context.SaveChangesAsync();

            return order.ToDto();
        }
        
        return BadRequest("Problem refunding order");
    }

}