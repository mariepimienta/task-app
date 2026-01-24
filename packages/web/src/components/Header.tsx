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
  isTemplateView?: boolean;
  onSaveTemplateToAllWeeks?: () => void;
  onDeleteWeek?: () => void;
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
  isTemplateView = false,
  onSaveTemplateToAllWeeks,
  onDeleteWeek,
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

        {isTemplateView && onSaveTemplateToAllWeeks && (
          <button
            className="save-template-button"
            onClick={onSaveTemplateToAllWeeks}
            title="Save template to all existing weeks"
          >
            💾 Save for All Future Weeks
          </button>
        )}

        {!isTemplateView && onDeleteWeek && (
          <button
            className="delete-week-button"
            onClick={onDeleteWeek}
            title="Delete this week"
          >
            🗑️ Delete Week
          </button>
        )}
      </div>
    </div>
  );
}
