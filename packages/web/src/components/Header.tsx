import './Header.css';

interface HeaderProps {
  wakeUpTime: string;
  showTasks: boolean;
  showCalendarEvents: boolean;
  onToggleShowTasks: () => void;
  onToggleShowCalendarEvents: () => void;
  weekTitle?: string;
}

export function Header({
  wakeUpTime,
  showTasks,
  showCalendarEvents,
  onToggleShowTasks,
  onToggleShowCalendarEvents,
  weekTitle,
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
      </div>
    </div>
  );
}
