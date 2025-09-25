// Date handling utilities for timezone-aware reservations
// Ensures calendar-day logic works correctly for Europe/Vilnius timezone

const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, addDays, format } = require('date-fns');

// Our business timezone
const VILNIUS_TZ = 'Europe/Vilnius';

/**
 * Check if input string is date-only format (YYYY-MM-DD)
 * @param {string} input - Date string to check
 * @returns {boolean} - True if date-only format
 */
function isDateOnly(input) {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

/**
 * Convert calendar day dates to UTC timestamp range
 * Interprets dates as all-day in Vilnius timezone
 * @param {string} startDateStr - Start date (YYYY-MM-DD)
 * @param {string} endDateStr - End date (YYYY-MM-DD)
 * @returns {Object} - { startAtUtc: Date, endAtUtc: Date }
 */
function toUtcRangeFromDates(startDateStr, endDateStr) {
  // Start at 00:00:00 local time on start date
  const startLocalISO = `${startDateStr}T00:00:00`;
  const startAtUtc = zonedTimeToUtc(startLocalISO, VILNIUS_TZ);
  
  // End at 00:00:00 local time on the day AFTER end date (exclusive)
  const endDateObj = new Date(`${endDateStr}T00:00:00`);
  const nextDay = addDays(endDateObj, 1);
  const endLocalISO = format(nextDay, "yyyy-MM-dd'T'00:00:00");
  const endAtUtc = zonedTimeToUtc(endLocalISO, VILNIUS_TZ);
  
  return { startAtUtc, endAtUtc };
}

/**
 * Get today's date string in Vilnius timezone
 * @returns {string} - Date in YYYY-MM-DD format
 */
function todayDateStrVilnius() {
  const now = new Date();
  const local = utcToZonedTime(now, VILNIUS_TZ);
  return format(local, 'yyyy-MM-dd');
}

/**
 * Get current datetime in Vilnius timezone as UTC Date object
 * @returns {Date} - Current time in Vilnius represented as UTC
 */
function nowVilniusAsUtc() {
  const now = new Date();
  const nowInVilnius = utcToZonedTime(now, VILNIUS_TZ);
  return zonedTimeToUtc(nowInVilnius, VILNIUS_TZ);
}

module.exports = {
  VILNIUS_TZ,
  isDateOnly,
  toUtcRangeFromDates,
  todayDateStrVilnius,
  nowVilniusAsUtc
};