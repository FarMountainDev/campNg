namespace Core.Entities;

public class CampgroundAmenity : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string MatIcon { get; set; }
}