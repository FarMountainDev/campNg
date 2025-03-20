namespace Core.Entities;

public class Campground : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string PictureUrl { get; set; }
    public bool HasSwimming { get; set; } = false;
    public bool HasHiking { get; set; } = false;
    public bool HasFishing { get; set; } = false;
    public bool HasBoatRentals { get; set; } = false;
    public bool HasStore { get; set; } = false;
    public bool HasShowers { get; set; } = false;
    public bool HasWifi { get; set; } = false;
    public bool AllowsPets { get; set; } = false;
    public ICollection<Campsite> Campsites { get; set; } = [];
}