namespace API.DTOs;

public class CampsiteDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Campground { get; set; }
    public string? CampsiteType { get; set; }
    public decimal? WeekDayPrice { get; set; }
    public decimal? WeekEndPrice { get; set; }
    public ICollection<ReservationDto> Reservations { get; set; } = [];
}