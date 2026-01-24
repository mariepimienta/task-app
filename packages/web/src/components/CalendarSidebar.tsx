import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getWeekStartFromDate, getCurrentWeekStart, getWeekRangeFromStart } from '../../../shared/src/index';
import './CalendarSidebar.css';

type Value = Date | null | [Date | null, Date | null];

interface CalendarSidebarProps {
  availableWeeks: string[]; // Array of week start dates (ISO strings)
  currentWeek: string | 'template'; // Currently selected week or 'template'
  onSelectWeek: (weekStart: string | 'template') => void;
  onCreateWeekFromDate?: (weekStart: string) => void;
}

export function CalendarSidebar({
  availableWeeks,
  currentWeek,
  onSelectWeek,
  onCreateWeekFromDate,
}: CalendarSidebarProps) {
  const [calendarValue, setCalendarValue] = useState<Value>(new Date());

  const handleDateClick = (value: Value) => {
    // Handle only single date selection (not range)
    if (!value || value instanceof Array) return;

    const weekStart = getWeekStartFromDate(value);

    // Auto-create week if it doesn't exist
    if (!availableWeeks.includes(weekStart)) {
      onCreateWeekFromDate?.(weekStart);
    }

    onSelectWeek(weekStart);
    setCalendarValue(value);
  };

  const getTileClassName = ({ date }: { date: Date; view: string }) => {
    const weekStart = getWeekStartFromDate(date);
    const classes: string[] = [];

    // Highlight weeks that exist
    if (availableWeeks.includes(weekStart)) {
      classes.push('has-week');
    }

    // Highlight current week
    if (weekStart === getCurrentWeekStart()) {
      classes.push('current-week');
    }

    // Highlight selected week
    if (currentWeek !== 'template' && weekStart === currentWeek) {
      classes.push('selected-week');
    }

    return classes.join(' ');
  };

  // Get selected week indicator text
  const selectedWeekText = currentWeek === 'template'
    ? 'Template Week'
    : getWeekRangeFromStart(currentWeek).label;

  return (
    <div className="calendar-sidebar">
      <div className="calendar-sidebar-header">
        <h2>Calendar</h2>
      </div>

      {/* Template Button */}
      <button
        className={`template-button ${currentWeek === 'template' ? 'active' : ''}`}
        onClick={() => onSelectWeek('template')}
      >
        <span className="template-icon">📋</span>
        <span className="template-label">Template</span>
      </button>

      {/* Selected Week Indicator */}
      <div className="selected-week-indicator">
        <div className="indicator-label">Selected Week</div>
        <div className="indicator-value">{selectedWeekText}</div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <Calendar
          onChange={handleDateClick}
          value={calendarValue}
          tileClassName={getTileClassName}
          showNeighboringMonth={false}
          navigationLabel={({ date }) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color has-week"></span>
          <span className="legend-text">Week exists</span>
        </div>
        <div className="legend-item">
          <span className="legend-color current-week"></span>
          <span className="legend-text">Current week</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected-week"></span>
          <span className="legend-text">Selected week</span>
        </div>
      </div>
    </div>
  );
}
