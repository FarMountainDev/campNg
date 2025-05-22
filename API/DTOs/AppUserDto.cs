namespace API.DTOs;

public class AppUserDto
{
    public required string Id { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public bool IsLockedOut { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = [];
}