/**
 * Timezone Utilities
 *
 * Provides utilities for handling timezone conversions and validations.
 */

/**
 * Converts a date from one timezone to another
 * @param date The date to convert
 * @param fromTimezone The source timezone
 * @param toTimezone The target timezone
 * @returns The converted date
 */
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTimezone }));
  const toDate = new Date(date.toLocaleString('en-US', { timeZone: toTimezone }));
  const diff = toDate.getTime() - fromDate.getTime();
  return new Date(date.getTime() + diff);
}

/**
 * Validates if a timezone string is valid
 * @param timezone The timezone string to validate
 * @returns True if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Gets the user's current timezone
 * @returns The user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Formats a date in a specific timezone
 * @param date The date to format
 * @param timezone The timezone to use
 * @param format The format to use (default: 'en-US')
 * @returns The formatted date string
 */
export function formatDateInTimezone(date: Date, timezone: string, format = 'en-US'): string {
  return date.toLocaleString(format, { timeZone: timezone });
}

/**
 * Gets the offset between two timezones in hours
 * @param timezone1 The first timezone
 * @param timezone2 The second timezone
 * @returns The offset in hours
 */
export function getTimezoneOffset(timezone1: string, timezone2: string): number {
  const date = new Date();
  const date1 = new Date(date.toLocaleString('en-US', { timeZone: timezone1 }));
  const date2 = new Date(date.toLocaleString('en-US', { timeZone: timezone2 }));
  return (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
}

/**
 * Gets a list of all available timezones
 * @returns An array of timezone strings
 */
export function getAvailableTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}
