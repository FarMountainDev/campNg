using Core.Entities.OrderAggregate;

namespace Core.Entities;

public class Reservation : BaseEntity
{
    public required string ReservationEmail { get; set; }
    public DateOnly StartDate { get; set; } // First night
    public DateOnly EndDate { get; set; } // Last night (check-out next day)
    public int CampsiteId { get; set; }
    public Campsite? Campsite { get; set; }
    public OrderItem? OrderItem { get; set; }
}