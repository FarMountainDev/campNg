namespace Core.Entities;

public class Reservation : BaseEntity
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CampsiteId { get; set; }
    public Campsite? Campsite { get; set; }
}