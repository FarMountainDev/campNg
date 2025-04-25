using System.ComponentModel.DataAnnotations;
using Core.Entities.OrderAggregate;

namespace API.DTOs;

public class CreateOrderDto
{
    [Required]
    public string CartId { get; set; } = string.Empty;
    
    [Required]
    public PaymentSummary PaymentSummary { get; set; } = null!;
}