﻿namespace Core.Entities.OrderAggregate;

public class ReservationOrdered
{
    public int CampsiteId { get; set; }
    public int CampgroundId { get; set; }
    public required string CampsiteName { get; set; }
    public required string CampsiteType { get; set; }
    public required string CampgroundName { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}