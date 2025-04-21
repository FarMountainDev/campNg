namespace Core.Models;

public class CartItem
{
    public int CampsiteId { get; set; }
    public required string CampsiteName { get; set; }
    public required string CampsiteType { get; set; }
    public required string CampgroundName { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal Price { get; set; }
}