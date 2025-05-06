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
}