import React from 'react';
import type { WeekRange } from '../../../shared/src/index';
import { getWeekRangeFromStart, getCurrentWeekStart } from '../../../shared/src/index';
import './WeekSelector.css';

interface WeekSelectorProps {
  availableWeeks: string[]; // Array of week start dates (ISO strings)
  currentWeek: string | 'template'; // Currently selected week or 'template'
  onSelectWeek: (weekStart: string | 'template') => void;
  onCreateNextWeek: () => void;
  onDeleteWeek?: (weekStart: string) => void;
}

export function WeekSelector({ availableWeeks, currentWeek, onSelectWeek, onCreateNextWeek, onDeleteWeek }: WeekSelectorProps) {
  const currentWeekStart = getCurrentWeekStart();

  // Sort weeks with current week first, then rest in reverse chronological order
  const sortedWeeks = [...availableWeeks].sort((a, b) => {
    // Current week always first
    if (a === currentWeekStart) return -1;
    if (b === currentWeekStart) return 1;
    // Rest sorted newest first
    return b.localeCompare(a);
  });

  const getWeekLabel = (weekStart: string): string => {
    const range = getWeekRangeFromStart(weekStart);
    const isCurrent = weekStart === currentWeekStart;
    return isCurrent ? `${range.label} (This Week)` : range.label;
  };

  const handleDeleteClick = (e: React.MouseEvent, weekStart: string) => {
    e.stopPropagation(); // Prevent selecting the week when clicking delete
    if (onDeleteWeek) {
      onDeleteWeek(weekStart);
    }
  };

  return (
    <div className="week-selector">
      <div className="week-selector-header">
        <h2>Weeks</h2>
        <button className="create-week-button" onClick={onCreateNextWeek} title="Create Next Week">
          + New Week
        </button>
      </div>

      <div className="week-list">
        {/* Template option */}
        <div
          className={`week-item ${currentWeek === 'template' ? 'active' : ''}`}
          onClick={() => onSelectWeek('template')}
        >
          <div className="week-icon">📋</div>
          <div className="week-label">Template</div>
        </div>

        {/* Week list */}
        {sortedWeeks.length > 0 ? (
          sortedWeeks.map(weekStart => (
            <div
              key={weekStart}
              className={`week-item ${currentWeek === weekStart ? 'active' : ''} ${weekStart === currentWeekStart ? 'current-week' : ''}`}
              onClick={() => onSelectWeek(weekStart)}
            >
              <div className="week-icon">
                {weekStart === currentWeekStart ? '📅' : '📆'}
              </div>
              <div className="week-label">{getWeekLabel(weekStart)}</div>
              {onDeleteWeek && (
                <button
                  className="delete-week-button"
                  onClick={(e) => handleDeleteClick(e, weekStart)}
                  title="Delete Week"
                  aria-label="Delete Week"
                >
                  ×
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="empty-message">No weeks created yet</div>
        )}
      </div>
    </div>
  );
}
