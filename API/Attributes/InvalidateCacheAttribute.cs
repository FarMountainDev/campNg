using Core.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class InvalidateCacheAttribute : Attribute, IAsyncActionFilter
{
    private readonly IEnumerable<string> patterns;

    public InvalidateCacheAttribute(string pattern)
    {
        patterns = [pattern];
    }

    public InvalidateCacheAttribute(params string[] patterns)
    {
        this.patterns = patterns;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();

        if (resultContext.Exception is null || resultContext.ExceptionHandled)
        {
            var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();

            foreach (var pattern in patterns)
            {
                await cacheService.RemoveCacheByPatternAsync(pattern);
            }
        }
    }
}