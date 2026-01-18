import type { Task, CalendarEvent, AppSettings, IStorage } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  wakeUpTime: '6am',
  showTasks: true,
  showCalendarEvents: true,
  googleCalendarConnected: false,
};

export abstract class BaseStorage implements IStorage {
  abstract getTasks(): Promise<Task[]>;
  abstract saveTasks(tasks: Task[]): Promise<void>;
  abstract getSettings(): Promise<AppSettings>;
  abstract saveSettings(settings: AppSettings): Promise<void>;
  abstract getCalendarEvents(): Promise<CalendarEvent[]>;
  abstract saveCalendarEvents(events: CalendarEvent[]): Promise<void>;

  protected async getItem(_key: string): Promise<string | null> {
    throw new Error('getItem must be implemented by platform-specific storage');
  }

  protected async setItem(_key: string, _value: string): Promise<void> {
    throw new Error('setItem must be implemented by platform-specific storage');
  }

  protected async removeItem(_key: string): Promise<void> {
    throw new Error('removeItem must be implemented by platform-specific storage');
  }
}

export const STORAGE_KEYS = {
  TASKS: 'tasks',
  SETTINGS: 'settings',
  CALENDAR_EVENTS: 'calendarEvents',
} as const;
