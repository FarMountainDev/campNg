using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class CampgroundsRepository(CampContext context) : ICampgroundsRepository
{
    public async Task<IReadOnlyList<Campground>> GetCampgroundsAsync()
    {
        return await context.Campgrounds
            .Include(c => c.Campsites)
            .ThenInclude(c => c.CampsiteType)
            .ToListAsync();
    }

    public async Task<Campground?> GetCampgroundByIdAsync(int id)
    {
        return await context.Campgrounds
            .Include(c => c.Campsites)
            .ThenInclude(c => c.CampsiteType)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public void AddCampground(Campground campground)
    {
        context.Campgrounds.Add(campground);
    }

    public void UpdateCampground(Campground campground)
    {
        context.Entry(campground).State = EntityState.Modified;
    }

    public void DeleteCampground(Campground campground)
    {
        context.Campgrounds.Remove(campground);
    }

    public bool CampgroundExists(int id)
    {
        return context.Campgrounds.Any(x => x.Id == id);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}