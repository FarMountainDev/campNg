namespace Core.Models;

public class OccupancyRate
{
    public required string Label { get; set; }
    public int Total { get; set; }
    public int Occupied { get; set; }
    public int Percentage { get; set; }
}