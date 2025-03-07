using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class CampContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Campground> Campgrounds { get; set; }
    public DbSet<Campsite> Campsites { get; set; }
    public DbSet<CampsiteType> CampsiteTypes { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CampContext).Assembly);
    }
}