using System.Text.Json;
using System.Text.Json.Serialization;

namespace API.Helpers;

public class JsonStringDateOnlyConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var dateString = reader.GetString();
            
            // Try parsing as DateTime first (handles ISO format with time component)
            if (DateTime.TryParse(dateString, out var dateTime))
            {
                return DateOnly.FromDateTime(dateTime);
            }
            
            // Then try parsing as DateOnly directly
            if (DateOnly.TryParse(dateString, out var dateOnly))
            {
                return dateOnly;
            }
        }
        
        throw new JsonException($"Unable to convert {reader.GetString()} to DateOnly.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}