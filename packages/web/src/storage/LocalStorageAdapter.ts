import {
  BaseStorage,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
} from '../../../shared/src/index';
import type {
  Task,
  CalendarEvent,
  AppSettings,
} from '../../../shared/src/index';

export class LocalStorageAdapter extends BaseStorage {
  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const eventsJson = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return [];
    }
  }

  async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving calendar events:', error);
      throw error;
    }
  }
}
