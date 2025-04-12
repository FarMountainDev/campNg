using System.ComponentModel.DataAnnotations;

namespace API.Attributes;

public class DateGreaterThanAttribute(string comparisonProperty) : ValidationAttribute
{
    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null)
            return new ValidationResult("Date value cannot be null");
        
        var currentValue = (DateTime)value;

        var property = validationContext.ObjectType.GetProperty(comparisonProperty);

        if (property == null)
            throw new ArgumentException("Property with this name not found");

        var comparisonValue = (DateTime)property.GetValue(validationContext.ObjectInstance)!;

        if (currentValue <= comparisonValue)
            return new ValidationResult(ErrorMessage);

        return ValidationResult.Success ?? new ValidationResult("Validation failed");
    }
}