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
        // Campground
        modelBuilder.Entity<Campground>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.PictureUrl).IsRequired().HasMaxLength(100);
        
            entity.HasMany(e => e.Campsites)
                .WithOne(e => e.Campground)
                .HasForeignKey(e => e.CampgroundId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // Campsite
        modelBuilder.Entity<Campsite>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
        
            entity.HasOne(e => e.Campground)
                .WithMany(e => e.Campsites)
                .HasForeignKey(e => e.CampgroundId);
            
            entity.HasOne(e => e.CampsiteType)
                .WithMany()
                .HasForeignKey(e => e.CampsiteTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    
        // CampsiteType
        modelBuilder.Entity<CampsiteType>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.WeekDayPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.WeekEndPrice).HasColumnType("decimal(18,2)");
        });
        
        base.OnModelCreating(modelBuilder);
    }
}