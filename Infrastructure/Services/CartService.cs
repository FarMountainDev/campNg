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
            TimeSpan.FromDays(30));

        if (!created) return null;
        
        return await GetCartAsync(cart.Id);
    }

    public async Task<bool> DeleteCartAsync(string key)
    {
        return await database.KeyDeleteAsync(key);
    }
}