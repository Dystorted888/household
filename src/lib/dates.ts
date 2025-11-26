import { addDays, startOfWeek, endOfWeek, format, isToday, isTomorrow } from "date-fns";

export function getCurrentWeek(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getWeekDays(date: Date = new Date()) {
  const { start } = getCurrentWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

export function getDayOfWeek(date: Date): string {
  return format(date, "EEEE"); // Monday, Tuesday, etc.
}

export function getWeekOffset(date: Date = new Date()): number {
  const { start } = getCurrentWeek(new Date());
  const { start: targetStart } = getCurrentWeek(date);
  return Math.round((targetStart.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

// Re-export commonly used date-fns functions
export { format, addDays, isToday, isTomorrow } from "date-fns";
