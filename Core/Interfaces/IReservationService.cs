using Core.Models;

namespace Core.Interfaces;

public interface IReservationService
{
    Task<ReservationValidationResult> ValidReservation(int campsiteId, DateOnly startDate, DateOnly endDate);
}