namespace API.DTOs;

public class AnnouncementDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Subtitle { get; set; }
    public required string Content { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public required string MessageType { get; set; }
    public bool ForceGlobal { get; set; }
    public int? PinnedPriority { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public ICollection<CampgroundDto>? Campgrounds { get; set; }
}