namespace Core.Models;

public class PendingReservation
{
    public string CartId { get; set; } = string.Empty;
    public int CampsiteId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime ExpiryTime { get; set; }
}