namespace Core.Specifications;

public class CampgroundParams : BaseParams
{
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
    
    public bool? HasHiking { get; set; } = null;
    public bool? HasSwimming { get; set; } = null;
    public bool? HasFishing { get; set; } = null;
    public bool? HasBoatRentals { get; set; } = null;
    public bool? HasStore { get; set; } = null;
    public bool? HasShowers { get; set; } = null;
    public bool? HasWifi { get; set; } = null;
    public bool? AllowsPets { get; set; } = null;
}