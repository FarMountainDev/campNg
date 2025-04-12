using Core.Entities;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService(IConfiguration config, ICartService cartService, CampContext context) : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId);
        
        if (cart == null) return null;

        foreach (var item in cart.Items)
        {
            // TODO final validation for campsite availability and length of stay
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
}