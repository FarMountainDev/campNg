namespace Core.Models;

public class PendingReservation
{
    public string CartId { get; set; } = string.Empty;
    public int CampsiteId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime ExpiryTime { get; set; }
}