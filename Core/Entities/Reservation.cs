namespace Core.Entities;

public class Reservation : BaseEntity
{
    public DateTime StartDate { get; set; } // First Night?
    public DateTime EndDate { get; set; } // Last Night?
    public int CampsiteId { get; set; }
    public Campsite? Campsite { get; set; }
}