using API.DTOs;
using API.Extensions;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrdersController(ICartService cartService, CampContext context) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        var email = User.GetEmail();

        var cart = await cartService.GetCartAsync(orderDto.CartId);
        
        if (cart is null) return BadRequest("Cart not found");
        
        if (cart.PaymentIntentId is null) return BadRequest("PaymentIntent not found");

        var items = new List<OrderItem>();
        
        foreach (var item in cart.Items)
        {
            var campsite = await context.Campsites.FindAsync(item.CampsiteId);
            
            if (campsite is null) return BadRequest("Campsite not found");

            var itemOrdered = new ReservationOrdered
            {
                CampsiteId = item.CampsiteId,
                CampsiteName = item.CampsiteName,
                CampgroundName = item.CampgroundName,
                CampsiteType = item.CampsiteType,
                StartDate = item.StartDate,
                EndDate = item.EndDate
            };
            
            var orderItem = new OrderItem
            {
                ReservationOrdered = itemOrdered,
                Price = item.Price
            };
            
            items.Add(orderItem);
        }
        
        var order = new Order
        {
            OrderItems = items,
            Subtotal = items.Sum(x => x.Price),
            PaymentSummary = orderDto.PaymentSummary,
            PaymentIntentId = cart.PaymentIntentId,
            BuyerEmail = email
        };
        
        await context.AddAsync(order);
        
        if (await context.SaveChangesAsync() > 0)
        {
            await cartService.DeleteCartAsync(cart.Id);
            
            return CreatedAtAction(nameof(CreateOrder), new { id = order.Id }, order);
        }
        
        return BadRequest("Problem creating order");
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
    {
        var orders = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .Where(x => x.BuyerEmail == User.GetEmail())
            .ToListAsync();
        
        var orderDtoList = orders.Select(order => order.ToDto()).ToList();

        return Ok(orderDtoList);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var order = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .FirstOrDefaultAsync(x => x.Id == id && x.BuyerEmail == User.GetEmail());

        if (order is null) return NotFound();
        
        return order.ToDto();
    }
}