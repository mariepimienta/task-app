import { useState, useEffect } from 'react';
import { getCurrentWeekStart, getWeekRangeFromStart } from '../../../shared/src/index';
import type { DayOfWeek } from '../../../shared/src/index';
import { useTasks } from '../hooks/useTasks';
import { useSettings } from '../hooks/useSettings';
import { Header } from '../components/Header';
import { DayColumn } from '../components/DayColumn';
import { WeekSelector } from '../components/WeekSelector';
import './WeeklyView.css';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function WeeklyView() {
  const {
    tasks,
    loading: tasksLoading,
    toggleTask,
    addTask,
    loadSampleData,
    moveTask,
    updateTaskTitle,
    getAvailableWeeks,
    createNextWeek,
    ensureCurrentWeekExists,
    deleteWeek,
  } = useTasks();
  const { settings, loading: settingsLoading, toggleShowTasks, toggleShowCalendarEvents } = useSettings();

  const [selectedWeek, setSelectedWeek] = useState<string | 'template'>(getCurrentWeekStart());

  // Ensure current week exists on load
  useEffect(() => {
    if (!tasksLoading) {
      ensureCurrentWeekExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksLoading]);

  if (tasksLoading || settingsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Filter tasks for selected week
  const weekTasks = selectedWeek === 'template'
    ? tasks.filter(t => t.weekStartDate === 'template')
    : tasks.filter(t => t.weekStartDate === selectedWeek);

  const getDayTasks = (day: DayOfWeek) => {
    const dayTasks = weekTasks.filter(t => t.dayOfWeek === day && !t.parentTaskId);
    return {
      am: settings.showTasks ? dayTasks.filter(t => t.timeOfDay === 'am').sort((a, b) => a.order - b.order) : [],
      pm: settings.showTasks ? dayTasks.filter(t => t.timeOfDay === 'pm').sort((a, b) => a.order - b.order) : [],
    };
  };

  const getChildTasksForWeek = (parentId: string) => {
    return weekTasks.filter(t => t.parentTaskId === parentId).sort((a, b) => a.order - b.order);
  };

  const handleAddTask = async (dayOfWeek: DayOfWeek, timeOfDay: 'am' | 'pm', title: string) => {
    await addTask(title, dayOfWeek, timeOfDay, {
      recurring: false,
      weekStartDate: selectedWeek === 'template' ? 'template' : selectedWeek
    });
  };

  const handleLoadSampleData = async () => {
    if (confirm('This will replace all existing tasks with sample data. Continue?')) {
      await loadSampleData();
    }
  };

  const handleCreateNextWeek = async () => {
    const newWeek = await createNextWeek();
    setSelectedWeek(newWeek);
  };

  const handleDeleteWeek = async (weekStartDate: string) => {
    if (weekStartDate === 'template') {
      return;
    }

    if (!confirm(`Are you sure you want to delete this week and all its tasks?`)) {
      return;
    }

    await deleteWeek(weekStartDate);

    // If we deleted the currently selected week, switch to template
    if (selectedWeek === weekStartDate) {
      const weeks = getAvailableWeeks();
      // Try to select current week, or fall back to template
      const currentWeek = getCurrentWeekStart();
      if (weeks.includes(currentWeek)) {
        setSelectedWeek(currentWeek);
      } else if (weeks.length > 0) {
        setSelectedWeek(weeks[weeks.length - 1]);
      } else {
        setSelectedWeek('template');
      }
    }
  };

  const availableWeeks = getAvailableWeeks();

  // Get current view title
  const viewTitle = selectedWeek === 'template'
    ? 'Template Week'
    : getWeekRangeFromStart(selectedWeek).label;

  return (
    <div className="weekly-view-container">
      <WeekSelector
        availableWeeks={availableWeeks}
        currentWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        onCreateNextWeek={handleCreateNextWeek}
        onDeleteWeek={handleDeleteWeek}
      />

      <div className="weekly-view">
        <Header
          wakeUpTime={settings.wakeUpTime}
          showTasks={settings.showTasks}
          showCalendarEvents={settings.showCalendarEvents}
          onToggleShowTasks={toggleShowTasks}
          onToggleShowCalendarEvents={toggleShowCalendarEvents}
          weekTitle={viewTitle}
        />

        <div className="days-container">
          {DAYS.map(day => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              tasks={getDayTasks(day)}
              onToggleTask={toggleTask}
              getChildTasks={getChildTasksForWeek}
              onDropTask={moveTask}
              onAddTask={handleAddTask}
              onUpdateTaskTitle={updateTaskTitle}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="footer">
            <button className="add-button secondary" onClick={handleLoadSampleData}>
              Load Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
