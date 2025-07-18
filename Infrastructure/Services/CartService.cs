using System.Text.Json;
using Core.Interfaces;
using Core.Models;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class CartService(IConnectionMultiplexer redis) : ICartService
{
    private const int ExpirationMinutes = 10;
    
    private readonly IDatabase database = redis.GetDatabase();
    
    public async Task<ShoppingCart?> GetCartAsync(string key)
    {
        var data = await database.StringGetAsync(key);
        if (data.IsNullOrEmpty) return null;
        
        var cart = JsonSerializer.Deserialize<ShoppingCart>(data!);
        if (cart == null) return null;
        
        var timeToLive = await database.KeyTimeToLiveAsync(key);
        if (timeToLive.HasValue)
            cart.ExpirationTime = DateTime.UtcNow.Add(timeToLive.Value);

        return cart;
    }

    public async Task<ShoppingCart?> SetCartAsync(ShoppingCart cart)
    {
        var created = await database.StringSetAsync(cart.Id, JsonSerializer.Serialize(cart),
            TimeSpan.FromMinutes(ExpirationMinutes));

        if (!created) return null;
        
        return await GetCartAsync(cart.Id);
    }

    public async Task<bool> DeleteCartAsync(string key)
    {
        return await database.KeyDeleteAsync(key);
    }
    
    public async Task<IEnumerable<PendingReservation>> GetAllPendingReservations()
    {
        var pendingReservations = new List<PendingReservation>();

        var server = redis.GetServer(redis.GetEndPoints().First());
        var cartKeys = server.Keys(pattern: "cart_*",database: database.Database).ToList();

        foreach (var cartKey in cartKeys)
        {
            var cartData = await database.StringGetAsync(cartKey);
            var timeToLive = await database.KeyTimeToLiveAsync(cartKey);

            if (cartData.IsNull || !timeToLive.HasValue) continue;
                
            var cart = JsonSerializer.Deserialize<ShoppingCart>(cartData.ToString());
            if (cart?.Items == null) continue;
                
            var cartExpirationTime = DateTime.UtcNow.Add(timeToLive.Value);
            var cartId = cartKey.ToString();

            pendingReservations.AddRange(cart.Items.Select(item => new PendingReservation
            {
                CartId = cartId,
                CampsiteId = item.CampsiteId,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                ExpiryTime = cartExpirationTime
            }));
        }

        return pendingReservations;
    }
}