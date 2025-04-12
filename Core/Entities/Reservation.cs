namespace Core.Entities;

public class Reservation : BaseEntity
{
    public DateTime StartDate { get; set; } // First night
    public DateTime EndDate { get; set; } // Last night (check-out next day)
    public int CampsiteId { get; set; }
    public Campsite? Campsite { get; set; }
}