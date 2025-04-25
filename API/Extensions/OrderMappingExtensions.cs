using API.DTOs;
using Core.Entities.OrderAggregate;

namespace API.Extensions;

public static class OrderMappingExtensions
{
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