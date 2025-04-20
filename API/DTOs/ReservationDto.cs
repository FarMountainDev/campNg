namespace API.DTOs;

public class ReservationDto
{
    public int Id { get; set; }
    public int CampsiteId { get; set; }
    public string CampsiteName { get; set; } = string.Empty;
    public string CampsiteType { get; set; } = string.Empty;
    public string CampgroundName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}