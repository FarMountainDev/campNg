using Core.Entities;

namespace API.DTOs;

public class CampsiteAvailabilityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CampgroundId { get; set; }
    public string CampgroundName { get; set; } = string.Empty;
    public int CampsiteTypeId { get; set; }
    public string CampsiteTypeName { get; set; } = string.Empty;
    public ICollection<ReservationDto> Reservations { get; set; } = new List<ReservationDto>();
    public ICollection<PendingReservationDto> PendingReservations { get; set; } = new List<PendingReservationDto>();
}

public class PendingReservationDto
{
    public string CartId { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime CartExpiryTime { get; set; }
}