using Core.Enums;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class ReservationService(CampContext context, IConfiguration configuration) : IReservationService
{
    public async Task<ReservationValidationResult> ValidReservation(int campsiteId, DateOnly startDate, DateOnly endDate)
    {
        if (await context.Campsites.FindAsync(campsiteId) is null)
            return ReservationValidationResult.Failure("Campsite not found");
    
        var maxDays = configuration.GetValue<int>("ReservationSettings:MaxDays");
    
        if (endDate.DayNumber - startDate.DayNumber + 1 > maxDays)
            return ReservationValidationResult.Failure($"Reservation cannot exceed {maxDays} days");
    
        var hasConflict = await context.Reservations
            .Where(r => r.CampsiteId == campsiteId)
            .AnyAsync(r => (startDate <= r.EndDate && r.StartDate <= endDate));
        
        return hasConflict
            ? ReservationValidationResult.Failure("Conflicting reservation exists") 
            : ReservationValidationResult.Success();
    }
}