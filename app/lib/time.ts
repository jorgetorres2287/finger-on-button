import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ET timezone
const ET_TIMEZONE = 'America/New_York';

/**
 * Get the next noon ET (12pm ET)
 */
export function getNoonET() {
  const ny = dayjs().tz(ET_TIMEZONE);
  const noon = ny.hour(12).minute(0).second(0).millisecond(0);
  return ny.isAfter(noon) ? noon.add(1, 'day').toDate() : noon.toDate();
}

/**
 * Get start of today in ET
 */
export function startOfTodayET() {
  return dayjs().tz(ET_TIMEZONE).startOf('day').toDate();
}

/**
 * Get end of today in ET
 */
export function endOfTodayET() {
  return dayjs().tz(ET_TIMEZONE).endOf('day').toDate();
}

/**
 * Calculate time until scheduled game start
 */
export function getTimeUntil(date: Date) {
  return dayjs(date).diff(dayjs(), 'second');
} 