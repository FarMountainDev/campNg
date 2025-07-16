using API.Extensions;
using API.SignalR;
using Core.Entities.OrderAggregate;
using Core.Enums;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers;

public class PaymentsController(CampContext context, IPaymentService paymentService, IHubContext<NotificationHub> hubContext,
    IConfiguration configuration, ILogger<PaymentsController> logger)
    : BaseApiController
{
    private readonly string whSecret = configuration["StripeSettings:WhSecret"]!;

    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);

        if (cart == null) return BadRequest("Problem with your cart");
        
        return Ok(cart);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();

        try
        {
            var stripeEvent = ConstructStripeEvent(json);

            if (stripeEvent.Data.Object is not PaymentIntent intent)
            {
                return BadRequest("Invalid event data");
            }

            await HandlePaymentIntentSucceeded(intent);

            return Ok();
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Stripe webhook error: {Message}", ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error: {Message}", ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error occurred");
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status == "succeeded")
        {
            // When testing locally, a race condition can occur where the order is not yet created for the first attempt.
            Order? order = null;
            var retrievalAttempt = 1;
            while (order == null && retrievalAttempt < 5)
            {
                order = await context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ReservationOrdered)
                    .FirstOrDefaultAsync(o => o.PaymentIntentId == intent.Id);
                
                if (order != null) continue;
                logger.LogWarning("Order not found for PaymentIntent ID: {PaymentIntentId} (Attempt {RetrievalAttempt})", intent.Id, retrievalAttempt);
                await Task.Delay(1000);
                retrievalAttempt++;
            }
            
            if (order == null)
                throw new Exception("Order not found");

            if ((long)order.GetTotal() * 100 != intent.Amount)
            {
                order.Status = OrderStatus.PaymentMismatch;
            }
            else
            {
                order.Status = OrderStatus.PaymentReceived;
            }

            await context.SaveChangesAsync();

            var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

            if (!string.IsNullOrEmpty(connectionId))
            {
                await hubContext.Clients.Client(connectionId).SendAsync("OrderCompleteNotification", order.ToDto());
            }
        }
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], whSecret);
        }
        catch
        {
            throw new StripeException("Invalid signature");
        }
    }
}