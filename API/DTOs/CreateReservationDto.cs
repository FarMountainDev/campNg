using System.ComponentModel.DataAnnotations;
using API.Attributes;

namespace API.DTOs;

public class CreateReservationDto
{
    [Required]
    [DataType(DataType.Date)]
    public DateOnly? StartDate { get; set; }
    
    [Required]
    [DataType(DataType.Date)]
    [DateGreaterThan("StartDate", ErrorMessage = "Start date cannot be greater than end date")]
    public DateOnly? EndDate { get; set; }
    
    [Required]
    public int? CampsiteId { get; set; }
}