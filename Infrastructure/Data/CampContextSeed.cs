using System.Text.Json;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class CampContextSeed
{
    public static async Task SeedAsync(CampContext context)
    {
        await SeedCampgroundsAsync(context);
        await SeedCampsiteTypesAsync(context);
        await SeedCampsitesAsync(context);
    }

    private static async Task SeedCampgroundsAsync(CampContext context)
    {
        if (!context.Campgrounds.Any())
        {
            await using var transaction = await context.Database.BeginTransactionAsync();
        
            try
            {
                var campgroundsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campgrounds.json");
                var campgrounds = JsonSerializer.Deserialize<List<Campground>>(campgroundsData);
            
                if (campgrounds == null) return;

                await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.Campgrounds ON");
            
                context.Campgrounds.AddRange(campgrounds);
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

                if (campsiteTypes == null) return;
                
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
            var campsitesData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/campsites.json");
            
            var campsites = JsonSerializer.Deserialize<List<Campsite>>(campsitesData);

            if (campsites == null) return;
            
            context.Campsites.AddRange(campsites);
            
            await context.SaveChangesAsync();
        }
    }
}