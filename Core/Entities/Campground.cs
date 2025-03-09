namespace Core.Entities;

public class Campground : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ICollection<Campsite>? Campsites { get; set; }
}