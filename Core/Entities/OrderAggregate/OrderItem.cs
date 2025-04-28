namespace Core.Entities.OrderAggregate;

public class OrderItem : BaseEntity
{
    public ReservationOrdered ReservationOrdered { get; set; } = null!;
    public decimal Price { get; set; }
    public int? ReservationId { get; set; }
    public Reservation? Reservation { get; set; }
}