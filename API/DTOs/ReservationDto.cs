namespace API.DTOs;

public class ReservationDto
{
    public int Id { get; set; }
    public string? Email { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int CampsiteId { get; set; }
}