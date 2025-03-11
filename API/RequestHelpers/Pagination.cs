namespace API.RequestHelpers;

public class Pagination<T>(int pageNumber, int pageSize, int count, IReadOnlyList<T> data)
{
    public int PageNumber { get; set; } = pageNumber;
    public int PageSize { get; set; } = pageSize;
    public int? Count { get; set; } = count;
    public IReadOnlyList<T> Data { get; set; } = data;
}