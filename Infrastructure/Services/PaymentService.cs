using Core.Entities;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly ICartService cartService;
    private readonly CampContext context;

    public PaymentService(IConfiguration config, ICartService cartService, CampContext context)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];
        this.cartService = cartService;
        this.context = context;
    }
    
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await cartService.GetCartAsync(cartId);
        
        if (cart == null) return null;

        foreach (var item in cart.Items)
        {
            var campsite = await context.Campsites.Include(x => x.CampsiteType)
                .FirstOrDefaultAsync(x => x.Id == item.CampsiteId);
            
            if (campsite?.CampsiteType is null) return null;

            var weekDayPrice = campsite.CampsiteType.WeekDayPrice;
            var weekEndPrice = campsite.CampsiteType.WeekEndPrice;
            
            decimal price = 0;
            var currentDate = item.StartDate;

            while (currentDate <= item.EndDate)
            {
                var isWeekend = currentDate.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday;
    
                price += isWeekend ? weekEndPrice : weekDayPrice;
    
                currentDate = currentDate.AddDays(1);
            }
            
            if (item.Price != price)
            {
                item.Price = price;
            }
        }
        
        var service = new PaymentIntentService();

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)cart.Items.Sum(item => item.Price * 100),
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };
            var paymentIntent = await service.CreateAsync(options);
            cart.PaymentIntentId = paymentIntent.Id;
            cart.ClientSecret = paymentIntent.ClientSecret;
        }
        else
        {
            var options = new PaymentIntentUpdateOptions
            {
                Amount = (long)cart.Items.Sum(item => item.Price * 100),
                Currency = "usd",
            };
            await service.UpdateAsync(cart.PaymentIntentId, options);
        }

        await cartService.SetCartAsync(cart);

        return cart;
    }

    public async Task<string> RefundPayment(string paymentIntentId)
    {
        var refundOptions = new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
        };
        
        var refundService = new RefundService();
        var result = await refundService.CreateAsync(refundOptions);

        return result.Status;
    }
}