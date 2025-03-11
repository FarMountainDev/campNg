namespace Core.Entities;

public class CampsiteType : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal WeekDayPrice { get; set; }
    public decimal WeekEndPrice { get; set; }
}