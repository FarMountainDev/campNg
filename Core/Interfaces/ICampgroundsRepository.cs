using Core.Entities;

namespace Core.Interfaces;

public interface ICampgroundsRepository
{
    Task<IReadOnlyList<Campground>> GetCampgroundsAsync();
    Task<Campground?> GetCampgroundByIdAsync(int id);
    void AddCampground(Campground campground);
    void UpdateCampground(Campground campground);
    void DeleteCampground(Campground campground);
    bool CampgroundExists(int id);
    Task<bool> SaveChangesAsync();
}