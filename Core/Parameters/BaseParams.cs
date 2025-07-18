﻿namespace Core.Parameters;

public class BaseParams
{
    private const int MaxPageSize = 50;
    public int PageNumber { get; set; } = 1;
    
    private int pageSize = 20;
    public int PageSize
    {
        get => pageSize;
        set => pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    public string? Sort { get; set; }
    public string? SortDirection { get; set; }
    
    private string? search;
    public string Search
    {
        get => search ?? "";
        set => search = value.ToLower();
    }
}