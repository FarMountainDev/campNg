using Core.Entities;

namespace API.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<Announcement> WhereActive(this IQueryable<Announcement> query)
    {
        return query.Where(a => !a.ExpirationDate.HasValue || a.ExpirationDate > DateTime.UtcNow);
    }
    
    public static IQueryable<Announcement> InDisplayOrder(this IQueryable<Announcement> query)
    {
        return query
            .OrderByDescending(a => a.PinnedPriority)
            .ThenByDescending(a => a.UpdatedAt ?? a.CreatedAt) // Use UpdatedAt if available, otherwise fall back to CreatedAt
            .ThenByDescending(a => a.CreatedAt);
    }
}