namespace API.DTOs;

public class PendingReservationDto
{
    public int CampsiteId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}