using System.ComponentModel.DataAnnotations.Schema;
using Core.Enums;

namespace Core.Entities;

public class Announcement : BaseEntity
{
    public required string Title { get; set; }
    public string? Subtitle { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ExpirationDate { get; set; } // Optional expiration date for the announcement
    public MessageType MessageType { get; set; } = MessageType.Default;
    public bool ForceGlobal { get; set; } = false; // If true, this announcement will be shown globally regardless of Campgrounds
    public int? PinnedPriority { get; set; } // Optional priority for pinned announcements, higher number means greater priority
    
    public AppUser? CreatedBy { get; set; }
    public string? CreatedById { get; set; }
    
    public AppUser? UpdatedBy { get; set; }
    public string? UpdatedById { get; set; }
    
    public ICollection<Campground> Campgrounds { get; set; } = new List<Campground>();
}