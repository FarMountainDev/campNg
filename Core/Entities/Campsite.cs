using System.ComponentModel.DataAnnotations.Schema;
using Core.Interfaces;

namespace Core.Entities;

public class Campsite : BaseEntity, IDtoConvertible
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Campground? Campground { get; set; }
    public int CampgroundId { get; set; }
    public CampsiteType? CampsiteType { get; set; }
    public int CampsiteTypeId { get; set; }
    public ICollection<Reservation>? Reservations { get; set; }
}