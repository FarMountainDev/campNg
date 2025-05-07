using API.Attributes;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrdersController(ICartService cartService, CampContext context, IReservationService reservationService) : BaseApiController
{
    [InvalidateCache("api/orders")]
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

            var reservationValid = await reservationService.ValidReservation(
                item.CampsiteId, item.StartDate, item.EndDate);
            
            if (!reservationValid.IsValid)
            {
                return BadRequest($"{item.CampsiteName} is not available for the selected dates");
            }
            
            var reservation = new Reservation
            {
                ReservationEmail = email,
                CampsiteId = item.CampsiteId,
                StartDate = item.StartDate,
                EndDate = item.EndDate
            };
    
            var orderItem = new OrderItem
            {
                ReservationOrdered = new ReservationOrdered
                {
                    CampsiteId = item.CampsiteId,
                    CampsiteName = item.CampsiteName,
                    CampgroundName = item.CampgroundName,
                    CampsiteType = item.CampsiteType,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate
                },
                Price = item.Price
            };
    
            reservation.OrderItem = orderItem;
            orderItem.Reservation = reservation;
    
            await context.Reservations.AddAsync(reservation);
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
            return order;
        }
        
        return BadRequest("Problem creating order");
    }

    [Cache((int)TimeSpan.SecondsPerDay)]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
    {
        var orders = await context.Orders
            .Include(x => x.OrderItems)
            .ThenInclude(x => x.ReservationOrdered)
            .Where(x => x.BuyerEmail == User.GetEmail())
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
        
        var orderDtoList = orders.Select(order => order.ToDto()).ToList();

        return Ok(orderDtoList);
    }
    
    [Cache((int)TimeSpan.SecondsPerDay)]
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