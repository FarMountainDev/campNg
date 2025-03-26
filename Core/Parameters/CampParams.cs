namespace Core.Parameters;

public class CampParams : BaseParams
{
    private const int StartHour = 13;
    private const int EndHour = 11;
    
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
    
    private DateTime? startDate;
    public DateTime? StartDate
    {
        get => startDate;
        set => startDate = value.HasValue 
            ? DateTime.SpecifyKind(
                new DateTime(value.Value.Year, value.Value.Month, value.Value.Day, StartHour, 0, 0),
                DateTimeKind.Utc)
            : null;
    }

    private DateTime? endDate;
    public DateTime? EndDate
    {
        get => endDate;
        set => endDate = value.HasValue 
            ? DateTime.SpecifyKind(
                new DateTime(value.Value.Year, value.Value.Month, value.Value.Day, EndHour, 0, 0),
                DateTimeKind.Utc)
            : null;
    }
}