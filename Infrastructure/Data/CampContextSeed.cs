﻿using System.Text.Json;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class CampContextSeed
{
    public static async Task SeedAsync(CampContext context)
    {
        await SeedCampgroundAmenitiesAsync(context);
        await SeedCampgroundsAsync(context);
        await SeedCampsiteTypesAsync(context);
        await SeedCampsitesAsync(context);
        await SeedReservationsAsync(context);
    }

    private static async Task SeedCampgroundAmenitiesAsync(CampContext context)
    {
        if (!context.CampgroundAmenities.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var amenitiesData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campgroundAmenities.json");
                var amenities = JsonSerializer.Deserialize<List<CampgroundAmenity>>(amenitiesData);
                
                if (amenities == null) return;
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.CampgroundAmenities ON");
                
                context.CampgroundAmenities.AddRange(amenities);
                await context.SaveChangesAsync();
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.CampgroundAmenities OFF");
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    private static async Task SeedCampgroundsAsync(CampContext context)
    {
        if (!context.Campgrounds.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();
        
            try
            {
                var campgroundsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campgrounds.json");
                
                // Custom JSON converter to handle the AmenityIds array
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var campgroundsWithAmenities = JsonSerializer.Deserialize<List<CampgroundSeedData>>(campgroundsData, options);

                if (campgroundsWithAmenities is null) return;
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.Campgrounds ON");
                
                foreach (var item in campgroundsWithAmenities)
                {
                    var campground = new Campground
                    {
                        Id = item.Id,
                        Name = item.Name,
                        Description = item.Description,
                        PictureUrl = item.PictureUrl,
                        Amenities = new List<CampgroundAmenity>()
                    };

                    // Add amenities to campground
                    if (item.AmenityIds != null)
                    {
                        foreach (var amenityId in item.AmenityIds)
                        {
                            var amenity = await context.CampgroundAmenities.FindAsync(amenityId);
                            if (amenity != null)
                            {
                                campground.Amenities.Add(amenity);
                            }
                        }
                    }

                    context.Campgrounds.Add(campground);
                }
                
                await context.SaveChangesAsync();
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.Campgrounds OFF");
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    private static async Task SeedCampsiteTypesAsync(CampContext context)
    {
        if (!context.CampsiteTypes.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var campsiteTypesData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campsiteTypes.json");
                var campsiteTypes = JsonSerializer.Deserialize<List<CampsiteType>>(campsiteTypesData);

                if (campsiteTypes is null) return;
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.CampsiteTypes ON");

                context.CampsiteTypes.AddRange(campsiteTypes);
                await context.SaveChangesAsync();
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.CampsiteTypes OFF");
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    private static async Task SeedCampsitesAsync(CampContext context)
    {
        if (!context.Campsites.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var campsitesData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campsites.json");
                var campsites = JsonSerializer.Deserialize<List<Campsite>>(campsitesData);

                if (campsites is null) return;
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.Campsites ON");
            
                context.Campsites.AddRange(campsites);
                await context.SaveChangesAsync();
                
                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.Campsites OFF");
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
    
    

    private static async Task SeedReservationsAsync(CampContext context)
    {
        if (!context.Reservations.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var campsites = await context.Campsites.ToListAsync();
                var startDate = DateTime.UtcNow.Date.AddYears(-1);
                var endDate = DateTime.UtcNow.Date.AddYears(1);
                var random = new Random(42); // Fixed seed for reproducibility
                var reservations = new List<Reservation>();

                foreach (var campsite in campsites)
                {
                    // Generate between 10-25 reservations per campsite
                    var targetReservationCount = random.Next(10, 26);
                    var attempts = 0;
                    const int maxAttempts = 100; // Limit attempts to avoid infinite loops
                    
                    while (reservations.Count(r => r.CampsiteId == campsite.Id) < targetReservationCount && attempts < maxAttempts)
                    {
                        attempts++;
                        
                        // Generate start date and duration
                        var reservationStart = GetWeightedRandomDate(random, startDate, endDate);
                        var duration = GetWeightedDuration(random);
                        var reservationEnd = reservationStart.AddDays(duration);
                        
                        var reservation = new Reservation
                        {
                            StartDate = reservationStart,
                            EndDate = reservationEnd,
                            CampsiteId = campsite.Id
                        };
                        
                        // Check for overlapping reservations
                        var overlaps = reservations
                            .Where(r => r.CampsiteId == campsite.Id)
                            .Any(r => r.StartDate < reservation.EndDate && r.EndDate > reservation.StartDate);
                        
                        if (!overlaps)
                        {
                            reservations.Add(reservation);
                        }
                    }
                }
            
                context.Reservations.AddRange(reservations);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
    
    // Helper method to generate random date with seasonal weighting
    private static DateTime GetWeightedRandomDate(Random random, DateTime start, DateTime end)
    {
        var totalDays = (int)(end - start).TotalDays;
        
        // Generate several candidate dates and pick the best one
        const int candidates = 5;
        var candidateDates = new DateTime[candidates];
        var scores = new double[candidates];
        
        for (var i = 0; i < candidates; i++)
        {
            var randomDays = random.Next(totalDays);
            candidateDates[i] = start.AddDays(randomDays);
            
            var month = candidateDates[i].Month;

            scores[i] = month switch
            {
                // Score based on season (higher = more preferred)
                >= 6 and <= 8 => 1.0 // Peak summer (June-August)
                ,
                5 or 9 => 0.7 // Late spring, early fall (May, September)
                ,
                4 or 10 => 0.4 // Mid-spring/fall (April, October)
                ,
                3 or 11 => 0.2 // Early spring, late fall (March, November)
                ,
                _ => 0.1
            };

            // Add some randomness
            scores[i] += random.NextDouble() * 0.3;
        }
        
        // Find candidate with the highest score
        var bestIndex = 0;
        for (var i = 1; i < candidates; i++)
        {
            if (scores[i] > scores[bestIndex])
                bestIndex = i;
        }
        
        return candidateDates[bestIndex];
    }

    // Helper method for weighted duration distribution
    private static int GetWeightedDuration(Random random)
    {
        var value = random.NextDouble();

        return value switch
        {
            // Weighted distribution favoring 2-5 days
            < 0.05 => 1,
            < 0.25 => 2,
            < 0.45 => 3,
            < 0.65 => 4,
            < 0.80 => 5,
            < 0.85 => 6,
            < 0.90 => 7,
            < 0.95 => random.Next(8, 11),
            _ => random.Next(11, 15)
        };
    }
    
    // Helper class for deserialization
    private class CampgroundSeedData
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string PictureUrl { get; set; }
        public List<int>? AmenityIds { get; set; }
    }
}