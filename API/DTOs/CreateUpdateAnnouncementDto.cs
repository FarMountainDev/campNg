using Core.Enums;

namespace API.DTOs;

public class CreateUpdateAnnouncementDto
{
    public required string Title { get; set; }
    public string? Subtitle { get; set; }
    public required string Content { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public MessageType MessageType { get; set; } = MessageType.Default;
    public bool ForceGlobal { get; set; } = false;
    public int? PinnedPriority { get; set; }
    public ICollection<int>? CampgroundIds { get; set; }
}