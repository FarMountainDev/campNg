// Help to avoid timezone issues with API's DateOnly format
export function normalizeDate(dateInput: string | Date | unknown): Date {
  try {
    if (typeof dateInput === 'string') {
      // Parse YYYY-MM-DD format without timezone conversion
      const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in JS
    } else if (dateInput instanceof Date) {
      // Extract just the date parts for a clean date at midnight local time
      return new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate()
      );
    }
    // Fall back to standard date conversion
    return new Date(dateInput as any);
  } catch (e) {
    console.error('Date parsing error:', e);
    return new Date(); // Return today as fallback
  }
}

export function getDateFromDateOnlyString(dateOnlyString: string): Date {
  const [year, month, day] = dateOnlyString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

