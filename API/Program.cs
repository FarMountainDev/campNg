using System.Text.Json.Serialization;
using API.Helpers;
using API.Middleware;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringDateOnlyConverter());
});;
builder.Services.AddDbContext<CampContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis") 
                           ?? throw new Exception("Could not get Redis connection string");
    var configOptions = ConfigurationOptions.Parse(connectionString, true);
    return ConnectionMultiplexer.Connect(configOptions);
});
builder.Services.AddSingleton<ICartService, CartService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<AppUser>()
    .AddEntityFrameworkStores<CampContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    .WithOrigins("http://localhost:4200", "https://localhost:4200"));

app.MapControllers();
app.MapGroup("api").MapIdentityApi<AppUser>();

try
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<CampContext>();
    await context.Database.MigrateAsync();
    await CampContextSeed.SeedAsync(context);
}
catch (Exception ex)
{
    Console.WriteLine(ex.Message);
    throw;
}

app.Run();
