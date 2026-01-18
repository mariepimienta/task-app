import './Header.css';

interface HeaderProps {
  wakeUpTime: string;
  showTasks: boolean;
  showCalendarEvents: boolean;
  onToggleShowTasks: () => void;
  onToggleShowCalendarEvents: () => void;
  weekTitle?: string;
  isCalendarConnected?: boolean;
  onConnectCalendar?: () => void;
  onDisconnectCalendar?: () => void;
}

export function Header({
  wakeUpTime,
  showTasks,
  showCalendarEvents,
  onToggleShowTasks,
  onToggleShowCalendarEvents,
  weekTitle,
  isCalendarConnected = false,
  onConnectCalendar,
  onDisconnectCalendar,
}: HeaderProps) {
  return (
    <div className="header">
      <div className="title-row">
        <h1 className="week-range">{weekTitle || 'Weekly View'}</h1>
        <div className="wake-up-time">*Wake up time: {wakeUpTime}</div>
      </div>

      <div className="controls-row">
        <button className="toggle-button" onClick={onToggleShowTasks}>
          {showTasks ? '✓' : '○'} Tasks
        </button>

        <button className="toggle-button" onClick={onToggleShowCalendarEvents}>
          {showCalendarEvents ? '✓' : '○'} Calendar
        </button>

        {isCalendarConnected ? (
          <button
            className="calendar-connect-button connected"
            onClick={onDisconnectCalendar}
            title="Disconnect Google Calendar"
          >
            📅 Connected
          </button>
        ) : (
          <button
            className="calendar-connect-button"
            onClick={onConnectCalendar}
            title="Connect Google Calendar"
          >
            📅 Connect Google Calendar
          </button>
        )}
      </div>
    </div>
  );
}
