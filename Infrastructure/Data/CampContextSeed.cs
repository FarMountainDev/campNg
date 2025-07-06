using System.Reflection;
using System.Text.Json;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Data;

public static class CampContextSeed
{
    private const string AdminRole = "Admin";
    private const string ModeratorRole = "Moderator";
    private const string MemberRole = "Member";

    private const string AdminEmail = "admin@test.com";
    
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (path == null) throw new DirectoryNotFoundException("Path to assembly location not found.");
        
        var context = serviceProvider.GetRequiredService<CampContext>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();

        await SeedRolesAsync(roleManager);
        await SeedUsersAsync(userManager);
        await SeedCampgroundAmenitiesAsync(context, path);
        await SeedCampgroundsAsync(context, path);
        await SeedCampsiteTypesAsync(context, path);
        await SeedCampsitesAsync(context, path);
        await SeedReservationsWithOrdersAsync(context);
        await SeedAnnouncements(context);
    }
    
    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        var roles = new List<string> { AdminRole, ModeratorRole, MemberRole };
        
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task SeedUsersAsync(UserManager<AppUser> userManager)
    {
        if (!userManager.Users.Any(x => x.UserName == AdminEmail))
        {
            var adminUser = new AppUser
            {
                UserName = AdminEmail,
                Email = AdminEmail,
                FirstName = "Admin",
                LastName = "User"
            };
            
            await userManager.CreateAsync(adminUser, "Pa$$w0rd");
            await userManager.AddToRoleAsync(adminUser, AdminRole);
        }

        if (!userManager.Users.Any(x => x.UserName == "moderator@test.com"))
        {
            var moderatorUser = new AppUser
            {
                UserName = "moderator@test.com",
                Email = "moderator@test.com",
                FirstName = "Moderator",
                LastName = "User"
            };
            
            await userManager.CreateAsync(moderatorUser, "Pa$$w0rd");
            await userManager.AddToRoleAsync(moderatorUser, ModeratorRole);
        }

        if (!userManager.Users.Any(x => x.UserName == "HappyCamper@test.com"))
        {
            var memberUser = new AppUser
            {
                UserName = "HappyCamper@test.com",
                Email = "HappyCamper@test.com",
                FirstName = "Happy",
                LastName = "Camper"
            };
            
            await userManager.CreateAsync(memberUser, "Pa$$w0rd");
            await userManager.AddToRoleAsync(memberUser, MemberRole);
        }
    }

    private static async Task SeedCampgroundAmenitiesAsync(CampContext context, string path)
    {
        if (!context.CampgroundAmenities.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync();

                try
                {
                    var amenitiesData = await File.ReadAllTextAsync(path + @"/Data/SeedData/campgroundAmenities.json");
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
            });
        }
    }

    private static async Task SeedCampgroundsAsync(CampContext context, string path)
    {
        if (!context.Campgrounds.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () => 
            {
                await using var transaction = await context.Database.BeginTransactionAsync();
            
                try
                {
                    var campgroundsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/campgrounds.json");
                    
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
            });
        }
    }

    private static async Task SeedCampsiteTypesAsync(CampContext context, string path)
    {
        if (!context.CampsiteTypes.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync();

                try
                {
                    var campsiteTypesData = await File.ReadAllTextAsync(path + @"/Data/SeedData/campsiteTypes.json");
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
            });
        }
    }

    private static async Task SeedCampsitesAsync(CampContext context, string path)
    {
        if (!context.Campsites.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync();

                try
                {
                    var campsitesData = await File.ReadAllTextAsync(path + @"/Data/SeedData/campsites.json");
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
            });
        }
    }
    
    private static async Task SeedReservationsWithOrdersAsync(CampContext context)
    {
        if (!context.Reservations.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync();

                try
                {
                    var campsites = await context.Campsites
                        .Include(c => c.CampsiteType)
                        .Include(c => c.Campground)
                        .ToListAsync();
                    var startDate = DateTime.UtcNow.Date.AddYears(-1);
                    var endDate = DateTime.UtcNow.Date.AddYears(1);
                    var random = new Random(42); // Fixed seed for reproducibility
                    var reservations = new List<Reservation>();
                    var orders = new List<Order>();

                    foreach (var campsite in campsites)
                    {
                        var targetReservationCount = random.Next(25, 50);
                        var attempts = 0;
                        const int maxAttempts = 150; // Limit attempts to avoid infinite loops

                        while (reservations.Count(r => r.CampsiteId == campsite.Id) < targetReservationCount && attempts < maxAttempts)
                        {
                            attempts++;

                            // Generate start date and duration
                            var reservationStart = GetWeightedRandomDate(random, startDate, endDate);
                            var duration = GetWeightedDuration(random);
                            var reservationEnd = reservationStart.AddDays(duration);

                            var reservation = new Reservation
                            {
                                Email = "seedData@test.com",
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
                                
                                // If reservation is in the past, set order date to a random date within the last 30 days before the reservation start date
                                // Otherwise, set order date to a random date within the last 30 days from today
                                var orderDate = reservationStart.ToDateTime(TimeOnly.MinValue) < DateTime.UtcNow 
                                    ? reservationStart.ToDateTime(TimeOnly.MinValue).AddDays(-random.Next(1, 31))
                                    : DateTime.UtcNow.AddDays(-random.Next(1, 31));
                                
                                var price = CalculateReservationPrice(campsite, reservation, random);
                                
                                // One seed order and OrderItem per reservation
                                var order = new Order
                                {
                                    BuyerEmail = "seedData@test.com",
                                    OrderDate = orderDate,
                                    Subtotal = price,
                                    Status = OrderStatus.PaymentReceived,
                                    PaymentIntentId = $"pi_seed_{Guid.NewGuid():N}",
                                    PaymentSummary = new PaymentSummary
                                    {
                                        Last4 = 4242,
                                        Brand = "Visa",
                                        ExpMonth = 12,
                                        ExpYear = 2025
                                    },
                                    OrderItems = new List<OrderItem>
                                    {
                                        new()
                                        {
                                            Price = price,
                                            Reservation = reservation,
                                            ReservationOrdered = new ReservationOrdered
                                            {
                                                CampgroundName = campsite.Campground!.Name,
                                                CampsiteId = campsite.Id,
                                                CampsiteName = campsite.Name,
                                                CampsiteType = campsite.CampsiteType!.Name,
                                                StartDate = reservation.StartDate,
                                                EndDate = reservation.EndDate
                                            }
                                        }
                                    }
                                };
                                
                                orders.Add(order);
                            }
                        }
                    }

                    context.Reservations.AddRange(reservations);
                    context.Orders.AddRange(orders);
                    await context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
    }

    private static async Task SeedAnnouncements(CampContext context)
    {
        if (!context.Announcements.Any())
        {
            await context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync();
                
                try
                {
                    var announcements = new List<Announcement>();
            
                    var demoAnnouncement = new Announcement
                    {
                        Title = "CampNg Demo Mode!",
                        Content = """
                                  This is a demo version of CampNg. You can explore the features, but some functionalities are limited.

                                  Registration is disabled for the demo, but you can still login as either a moderator or a basic user to explore the application.

                                  Moderators will have access to the admin panel, but they cannot perform most of the actions there.

                                  Basic users can search for available campsites and "purchase" new reservations.
                                  """,
                        MessageType = MessageType.Warning,
                        PinnedPriority = 99
                    };
                    announcements.Add(demoAnnouncement);
            
                    var welcomeAnnouncement = new Announcement
                    {
                        Title = "Welcome to CampNg!",
                        Content = """
                                  Thank you for using CampNg! We hope you enjoy your camping experience.

                                  If you have any questions or feedback, feel free to reach out to us.
                                  """,
                        MessageType = MessageType.Success
                    };
                    announcements.Add(welcomeAnnouncement);
                    
                    var crystalShores = await context.Campgrounds.FirstAsync(c => c.Id == 2);
                    var storeConstructionAnnouncement = new Announcement
                    {
                        Title = "Store Under Construction",
                        Content = """
                                  Our camp store is currently under construction. We are working hard to bring you a better shopping experience.

                                  Campers may hear construction noise during the day, but we will do our best to minimize any inconvenience.
                                  """,
                        ExpirationDate = DateTime.UtcNow.AddDays(30),
                        MessageType = MessageType.Warning,
                        PinnedPriority = 1,
                        Campgrounds = new List<Campground> { crystalShores }
                    };
                    announcements.Add(storeConstructionAnnouncement);
                    
                    var waterActivitiesAnnouncement = new Announcement
                    {
                        Title = "Water Activities Available",
                        Content = """
                                  We are excited to announce that water activities are now available at Crystal Shores!

                                  Enjoy kayaking, paddleboarding, and fishing in our beautiful lake.
                                  """,
                        MessageType = MessageType.Info,
                        Campgrounds = new List<Campground> { crystalShores }
                    };
                    announcements.Add(waterActivitiesAnnouncement);
                    
                    var cedarRidge = await context.Campgrounds.FirstAsync(c => c.Id == 1);
                    var silverPineMeadows = await context.Campgrounds.FirstAsync(c => c.Id == 4);
                    var fireBanAnnouncement = new Announcement
                    {
                        Title = "Fire Ban in Effect",
                        Content = """
                                  Due to dry conditions, a fire ban is currently in effect. Open fires of any kind are prohibited until further notice.
                                  """,
                        MessageType = MessageType.Error,
                        PinnedPriority = 2,
                        ForceGlobal = true,
                        Campgrounds = new List<Campground> { cedarRidge, silverPineMeadows }
                    };
                    announcements.Add(fireBanAnnouncement);
                    
                    var expiredAnnouncement = new Announcement
                    {
                        Title = "Expired Announcement",
                        Content = "This announcement has expired and should not be displayed.",
                        ExpirationDate = DateTime.UtcNow.AddDays(-1), // Set to a past date to simulate expiration
                        PinnedPriority = 0
                    };
                    announcements.Add(expiredAnnouncement);
                    
                    context.Announcements.AddRange(announcements);
                    
                    await context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
    }
    
    private static DateOnly GetWeightedRandomDate(Random random, DateTime start, DateTime end)
    {
        var totalDays = (int)(end - start).TotalDays;
        
        // Generate several candidate dates and pick the best one
        const int candidates = 5;
        var candidateDates = new DateOnly[candidates];
        var scores = new double[candidates];
        
        for (var i = 0; i < candidates; i++)
        {
            var randomDays = random.Next(totalDays);
            candidateDates[i] = DateOnly.FromDateTime(start.AddDays(randomDays));
            
            var month = candidateDates[i].Month;

            scores[i] = month switch
            {
                // Score based on season (higher = more preferred)
                >= 6 and <= 8 => 1.0 // Peak summer (June-August)
                ,
                5 or 9 => 0.9 // Late spring, early fall (May, September)
                ,
                4 or 10 => 0.8 // Mid-spring/fall (April, October)
                ,
                3 or 11 => 0.7 // Early spring, late fall (March, November)
                ,
                _ => 0.3 // Winter (December-February)
            };

            // Add some randomness
            scores[i] += random.NextDouble() * 0.3;
        }
        
        // Find the candidate with the highest score
        var bestIndex = 0;
        for (var i = 1; i < candidates; i++)
        {
            if (scores[i] > scores[bestIndex])
                bestIndex = i;
        }
        
        return candidateDates[bestIndex];
    }

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
            _ => random.Next(11, 14)
        };
    }
    
    private static decimal CalculateReservationPrice(Campsite campsite, Reservation reservation, Random random)
    {
        if (campsite.CampsiteType == null)
            throw new ArgumentNullException(nameof(campsite.CampsiteType), "Campsite type cannot be null.");

        var weekdayPrice = campsite.CampsiteType.WeekDayPrice;
        var weekendPrice = campsite.CampsiteType.WeekEndPrice;
    
        decimal totalPrice = 0;
        var current = reservation.StartDate;
    
        while (current <= reservation.EndDate)
        {
            var isWeekend = current.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday;
        
            if (isWeekend)
                totalPrice += weekendPrice;
            else
                totalPrice += weekdayPrice;
            
            current = current.AddDays(1);
        }

        return Math.Round(totalPrice, 2);
    }
    
    private class CampgroundSeedData
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string PictureUrl { get; set; }
        public List<int>? AmenityIds { get; set; }
    }
}