using Core.Entities.OrderAggregate;
using Core.Interfaces;

namespace Core.Entities;

public class Reservation : BaseEntity, IDtoConvertible
{
    public required string Email { get; set; }
    public DateOnly StartDate { get; set; } // First night
    public DateOnly EndDate { get; set; } // Last night (check-out next day)
    public int CampsiteId { get; set; }
    public Campsite? Campsite { get; set; }
    public int? OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }
}