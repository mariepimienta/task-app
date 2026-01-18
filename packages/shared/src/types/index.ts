export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TimeOfDay = 'am' | 'pm';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dayOfWeek: DayOfWeek;
  timeOfDay: TimeOfDay;
  recurring: boolean;
  weeklyRecurrence?: boolean; // true if repeats every week
  parentTaskId?: string; // For nested tasks
  order: number; // For sorting
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  weekStartDate?: string; // ISO 8601 date string for Monday of week, or 'template' for template tasks
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  source: 'google'; // Extensible for future calendar sources
  visible: boolean;
}

export interface AppSettings {
  wakeUpTime: string; // e.g., "6am"
  showTasks: boolean;
  showCalendarEvents: boolean;
  googleCalendarConnected: boolean;
  googleCalendarTokens?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
}

export interface IStorage {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getCalendarEvents(): Promise<CalendarEvent[]>;
  saveCalendarEvents(events: CalendarEvent[]): Promise<void>;
}
