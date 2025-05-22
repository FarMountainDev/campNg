using API.DTOs;
using Core.Entities;
using Core.Entities.OrderAggregate;

namespace API.Extensions;

public static class ToDtoMappingExtensions
{
    public static AppUserDto ToDto(this AppUser user, IReadOnlyList<string> roles)
    {
        return new AppUserDto()
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
            IsLockedOut = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow,
            Roles = roles
        };
    }
    
    public static CampgroundDto ToDto(this Campground campground)
    {
        return new CampgroundDto()
        {
            Id = campground.Id,
            Name = campground.Name,
            Description = campground.Description,
            PictureUrl = campground.PictureUrl,
            Amenities = campground.Amenities,
            Campsites = campground.Campsites.Select(c => c.ToDto()).ToList()
        };
    }

    public static CampsiteDto ToDto(this Campsite campsite)
    {
        campsite.Reservations ??= [];

        return new CampsiteDto()
        {
            Id = campsite.Id,
            Name = campsite.Name,
            Description = campsite.Description,
            Campground = campsite.Campground?.Name,
            CampsiteType = campsite.CampsiteType?.Name,
            WeekDayPrice = campsite.CampsiteType?.WeekDayPrice,
            WeekEndPrice = campsite.CampsiteType?.WeekEndPrice,
            Reservations = campsite.Reservations.Select(r => r.ToDto()).ToList()
        };
    }

    public static ReservationDto ToDto(this Reservation reservation, bool includeEmail = false)
    {
        var dto = new ReservationDto()
        {
            Id = reservation.Id,
            StartDate = reservation.StartDate,
            EndDate = reservation.EndDate,
            CampsiteId = reservation.CampsiteId,
            CampsiteName = reservation.Campsite?.Name,
            OrderItemId = reservation.OrderItem?.Id,
            OrderId = reservation.OrderItem?.OrderId
        };
        
        if (includeEmail)
            dto.Email = reservation.Email;
    
        return dto;
    }

    public static OrderDto ToDto(this Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            BuyerEmail = order.BuyerEmail,
            OrderDate = order.OrderDate,
            PaymentSummary = order.PaymentSummary,
            OrderItems = order.OrderItems.Select(x => x.ToDto()).ToList(),
            Subtotal = order.Subtotal,
            Total = order.GetTotal(),
            Status = order.Status.ToString(),
            PaymentIntentId = order.PaymentIntentId,
        };
    }

    public static OrderItemDto ToDto(this OrderItem orderItem)
    {
        return new OrderItemDto
        {
            CampsiteId = orderItem.ReservationOrdered.CampsiteId,
            CampsiteName = orderItem.ReservationOrdered.CampsiteName,
            CampsiteType = orderItem.ReservationOrdered.CampsiteType,
            CampgroundName = orderItem.ReservationOrdered.CampgroundName,
            StartDate = orderItem.ReservationOrdered.StartDate,
            EndDate = orderItem.ReservationOrdered.EndDate,
            Price = orderItem.Price,
        };
    }
}