namespace Core.Parameters;

public class CampParams : BaseParams
{
    public int? CampgroundId { get; set; } = null;
    
    private List<int> campgroundAmenities = [];
    public List<int> CampgroundAmenityIds() => campgroundAmenities;
    public string CampgroundAmenities
    {
        get => string.Join(',', campgroundAmenities);
        set
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                campgroundAmenities = [];
            }
            else
            {
                campgroundAmenities = value.Split(',')
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : -1)
                    .Where(id => id != -1)
                    .ToList();
            }
        }
    }
    
    private List<int> campsiteTypes = [];
    public List<int> CampsiteTypeIds() => campsiteTypes;
    public string CampsiteTypes
    {
        get => string.Join(',', campsiteTypes);
        set
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                campsiteTypes = [];
            }
            else
            {
                campsiteTypes = value.Split(',')
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : -1)
                    .Where(id => id != -1)
                    .ToList();
            }
        }
    }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}