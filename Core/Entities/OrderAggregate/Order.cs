﻿using Core.Enums;
using Core.Interfaces;

namespace Core.Entities.OrderAggregate;

public class Order : BaseEntity, IDtoConvertible
{
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public required string BuyerEmail { get; set; }
    public PaymentSummary PaymentSummary { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public decimal Subtotal { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public required string PaymentIntentId { get; set; }
    
    public decimal GetTotal()
    {
        return Subtotal;
    }
}