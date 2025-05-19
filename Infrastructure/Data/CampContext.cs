using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Enums;
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
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // AppUser
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
        });
        
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
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.HasOne(e => e.Campsite)
                .WithMany(e => e.Reservations)
                .HasForeignKey(e => e.CampsiteId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.OrderItem)
                .WithOne(e => e.Reservation)
                .HasForeignKey<OrderItem>(e => e.ReservationId)
                .OnDelete(DeleteBehavior.SetNull);
        });
            
        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.OwnsOne(e => e.PaymentSummary, o =>
            {
                o.Property(p => p.Brand).HasMaxLength(50);
                o.WithOwner();
            });
            entity.Property(e => e.Status).HasConversion(
                o => o.ToString(),
                o => Enum.Parse<OrderStatus>(o));
            entity.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");
            entity.HasMany(e => e.OrderItems).WithOne().OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.OrderDate).HasConversion(
                d => d.ToUniversalTime(),
                d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
            entity.Property(e => e.BuyerEmail).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PaymentIntentId).IsRequired().HasMaxLength(512);
        });
        
        // OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.OwnsOne(e => e.ReservationOrdered, o =>
            {
                o.Property(p => p.CampsiteName).HasMaxLength(50);
                o.Property(p => p.CampgroundName).HasMaxLength(50);
                o.Property(p => p.CampsiteType).HasMaxLength(50);
                o.WithOwner();
            });
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
        });
        
        base.OnModelCreating(modelBuilder);
    }
}