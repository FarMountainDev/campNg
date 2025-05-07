using System.Text.Json;
using System.Text.Json.Serialization;
using Core.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class ResponseCacheService(IConnectionMultiplexer redis) : IResponseCacheService
{
    private readonly IDatabase database = redis.GetDatabase(1);
    
    public async Task CacheResponseAsync(string cacheKey, object response, TimeSpan timeToLive)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        var serializedResponse = JsonSerializer.Serialize(response, options);
        
        await database.StringSetAsync(cacheKey, serializedResponse, timeToLive);
    }

    public async Task<string?> GetCachedResponseAsync(string cacheKey)
    {
        var cachedResponse = await database.StringGetAsync(cacheKey);
        
        if (string.IsNullOrEmpty(cachedResponse)) return null;

        return cachedResponse;
    }

    public async Task RemoveCacheByPatternAsync(string pattern)
    {
        var server = redis.GetServer(redis.GetEndPoints().First());
        var keys = server.Keys(database: 1, pattern: $"*{pattern}*").ToArray();

        if (keys.Length != 0)
        {
            await database.KeyDeleteAsync(keys);
        }
    }
}