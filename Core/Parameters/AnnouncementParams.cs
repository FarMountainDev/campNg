namespace Core.Parameters;

public class AnnouncementParams : BaseParams
{
    private List<int> campgrounds = [];
    public List<int> CampgroundIds() => campgrounds;
    public string Campgrounds
    {
        get => string.Join(',', campgrounds);
        set
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                campgrounds = [];
            }
            else
            {
                campgrounds = value.Split(',')
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : -1)
                    .Where(id => id != -1)
                    .ToList();
            }
        }
    }

    public string? MessageType { get; set; }
}