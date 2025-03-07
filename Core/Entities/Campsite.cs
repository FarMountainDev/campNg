namespace Core.Entities;

public class Campsite : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Type { get; set; }
}