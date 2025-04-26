using Core.Enums;

namespace Core.Models;

public class ReservationValidationResult
{
    public bool IsValid { get; private set; }
    public string ErrorMessage { get; private set; }

    private ReservationValidationResult(bool isValid, string errorMessage = "")
    {
        IsValid = isValid;
        ErrorMessage = errorMessage;
    }

    public static ReservationValidationResult Success() => new(true);
    public static ReservationValidationResult Failure(string message) => new(false, message);
}