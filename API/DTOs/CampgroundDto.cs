using Core.Entities;

namespace API.DTOs;

public class CampgroundDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public ICollection<CampgroundAmenity> Amenities { get; set; } = [];
    public ICollection<CampsiteDto> Campsites { get; set; } = [];
}