using System.Text.Json;
using Core.Interfaces;
using Core.Models;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class CartService(IConnectionMultiplexer redis) : ICartService
{
    private readonly IDatabase database = redis.GetDatabase();
    
    public async Task<ShoppingCart?> GetCartAsync(string key)
    {
        var data = await database.StringGetAsync(key);
        
        return data.IsNullOrEmpty 
            ? null 
            : JsonSerializer.Deserialize<ShoppingCart>(data!);
    }

    public async Task<ShoppingCart?> SetCartAsync(ShoppingCart cart)
    {
        var created = await database.StringSetAsync(cart.Id, JsonSerializer.Serialize(cart),
            TimeSpan.FromMinutes(60));

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
            var expiryTime = await database.KeyTimeToLiveAsync(cartKey);

            if (cartData.IsNull || !expiryTime.HasValue) continue;
                
            var cart = JsonSerializer.Deserialize<ShoppingCart>(cartData.ToString());
            if (cart?.Items == null) continue;
                
            var cartExpiry = DateTime.UtcNow.Add(expiryTime.Value);
            var cartId = cartKey.ToString();

            pendingReservations.AddRange(cart.Items.Select(item => new PendingReservation
            {
                CartId = cartId,
                CampsiteId = item.CampsiteId,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                ExpiryTime = cartExpiry
            }));
        }

        return pendingReservations;
    }
}