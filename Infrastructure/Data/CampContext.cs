using Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class CampContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Campground> Campgrounds { get; set; }
    public DbSet<Campsite> Campsites { get; set; }
    public DbSet<CampsiteType> CampsiteTypes { get; set; }
    public DbSet<CampgroundAmenity> CampgroundAmenities { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Campground
        modelBuilder.Entity<Campground>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.PictureUrl).IsRequired().HasMaxLength(100);

            entity.HasMany(e => e.Amenities)
                .WithMany();
        
            entity.HasMany(e => e.Campsites)
                .WithOne(e => e.Campground)
                .HasForeignKey(e => e.CampgroundId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // CampgroundAmenity
        modelBuilder.Entity<CampgroundAmenity>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.MatIcon).IsRequired().HasMaxLength(50);
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
            
            entity.HasMany(e => e.Reservations)
                .WithOne(e => e.Campsite)
                .HasForeignKey(e => e.CampsiteId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    
        // CampsiteType
        modelBuilder.Entity<CampsiteType>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.WeekDayPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.WeekEndPrice).HasColumnType("decimal(18,2)");
        });
        
        // Reservation
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
        
            entity.HasOne(e => e.Campsite)
                .WithMany(e => e.Reservations)
                .HasForeignKey(e => e.CampsiteId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        base.OnModelCreating(modelBuilder);
    }
}