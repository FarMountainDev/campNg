namespace Core.Entities;

public class Campsite : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required Campground Campground { get; set; }
    public int CampgroundId { get; set; }
    public required CampsiteType CampsiteType { get; set; }
    public int CampsiteTypeId { get; set; }
}