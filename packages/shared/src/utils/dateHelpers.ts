import {
  startOfWeek,
  endOfWeek,
  format,
  addDays,
  isSameWeek,
  parseISO,
  isWithinInterval,
  startOfYear,
  addWeeks,
  isBefore,
  isAfter,
} from 'date-fns';
import { DayOfWeek } from '../types';

export interface WeekRange {
  start: Date;
  end: Date;
  label: string; // e.g., "Jan 12th - Jan 18th"
}

export function getCurrentWeekRange(): WeekRange {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  const label = `${format(start, 'MMM do')} - ${format(end, 'MMM do')}`;

  return { start, end, label };
}

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
}

export function getDateForDayOfWeek(dayOfWeek: DayOfWeek, weekStart: Date): Date {
  const dayMap: Record<DayOfWeek, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  return addDays(weekStart, dayMap[dayOfWeek]);
}

export function isEventInCurrentWeek(eventStartTime: string): boolean {
  const eventDate = parseISO(eventStartTime);
  const now = new Date();
  return isSameWeek(eventDate, now, { weekStartsOn: 1 });
}

export function isEventInWeekRange(eventStartTime: string, weekRange: WeekRange): boolean {
  const eventDate = parseISO(eventStartTime);
  return isWithinInterval(eventDate, { start: weekRange.start, end: weekRange.end });
}

export function getTimeOfDayFromDate(date: Date): 'am' | 'pm' {
  const hours = date.getHours();
  return hours < 12 ? 'am' : 'pm';
}

export function formatTime(date: Date): string {
  return format(date, 'h:mma'); // e.g., "6:00am"
}

// Get Monday of current week as ISO string
export function getCurrentWeekStart(): string {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
}

// Get Monday of a specific date's week as ISO string
export function getWeekStartFromDate(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
}

// Get week range for a specific week start date
export function getWeekRangeFromStart(weekStartISO: string): WeekRange {
  const start = parseISO(weekStartISO);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  const label = `${format(start, 'MMM do')} - ${format(end, 'MMM do')}`;
  return { start, end, label };
}

// Get all weeks in a year
export function getWeeksInYear(year: number): string[] {
  const weeks: string[] = [];
  const yearStart = startOfYear(new Date(year, 0, 1));
  const firstMonday = startOfWeek(yearStart, { weekStartsOn: 1 });

  let currentWeek = firstMonday;
  const yearEnd = new Date(year, 11, 31);

  while (isBefore(currentWeek, yearEnd) || isSameWeek(currentWeek, yearEnd, { weekStartsOn: 1 })) {
    weeks.push(format(currentWeek, 'yyyy-MM-dd'));
    currentWeek = addWeeks(currentWeek, 1);
  }

  return weeks;
}

// Get next week's start date
export function getNextWeekStart(currentWeekStart: string): string {
  const current = parseISO(currentWeekStart);
  const next = addWeeks(current, 1);
  return format(next, 'yyyy-MM-dd');
}

// Get previous week's start date
export function getPreviousWeekStart(currentWeekStart: string): string {
  const current = parseISO(currentWeekStart);
  const previous = addWeeks(current, -1);
  return format(previous, 'yyyy-MM-dd');
}
