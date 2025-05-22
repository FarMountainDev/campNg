namespace Core.Entities.OrderAggregate;

public class OrderItem : BaseEntity
{
    public ReservationOrdered ReservationOrdered { get; set; } = null!;
    public decimal Price { get; set; }
    public Reservation? Reservation { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
}