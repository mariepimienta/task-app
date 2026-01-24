import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { parseISO } from 'date-fns';
import { DayOfWeek, TimeOfDay, Task, getCurrentWeekStart, getWeekRangeFromStart, getDateForDayOfWeek, getTimeOfDayFromDate } from '@task-app/shared';
import { useTasks } from '../hooks/useTasks';
import { useSettings } from '../hooks/useSettings';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { Header } from '../components/Header';
import { DayColumn } from '../components/DayColumn';
import { WeekSelector } from '../components/WeekSelector';
import { AddTaskModal } from '../components/AddTaskModal';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function WeeklyView() {
  const {
    tasks,
    loading: tasksLoading,
    toggleTask,
    addTask,
    getAvailableWeeks,
    createNextWeek,
    createNewWeek,
    ensureCurrentWeekExists,
    updateAllWeeksFromTemplate,
    reorderTasks,
  } = useTasks();
  const { settings, loading: settingsLoading, toggleShowTasks, toggleShowCalendarEvents } = useSettings();
  const {
    isConnected: isCalendarConnected,
    calendarEvents,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    handleOAuthCallback,
    fetchCalendarEvents,
  } = useGoogleCalendar();

  const [selectedWeek, setSelectedWeek] = useState<string | 'template'>(getCurrentWeekStart());
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    if (!tasksLoading) {
      ensureCurrentWeekExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksLoading]);

  // Auto-create selected week if it doesn't exist
  useEffect(() => {
    if (!tasksLoading && selectedWeek !== 'template') {
      const weeks = getAvailableWeeks();
      if (!weeks.includes(selectedWeek)) {
        createNewWeek(selectedWeek);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek, tasksLoading]);

  // Handle OAuth callback (for web preview mode)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        Alert.alert('Authentication Error', `Failed to connect: ${error}`);
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (code) {
        handleOAuthCallback(code).then((success) => {
          if (success) {
            Alert.alert('Success', 'Google Calendar connected successfully!');
          } else {
            Alert.alert('Error', 'Failed to connect Google Calendar');
          }
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch calendar events when connected or week changes
  useEffect(() => {
    if (isCalendarConnected && selectedWeek !== 'template') {
      fetchCalendarEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarConnected, selectedWeek]);

  if (tasksLoading || settingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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

  const getDayCalendarEvents = (day: DayOfWeek) => {
    if (!settings.showCalendarEvents || selectedWeek === 'template') {
      return { am: [], pm: [] };
    }

    // Get the date for this day of the week
    const weekStart = parseISO(selectedWeek);
    const dayDate = getDateForDayOfWeek(day, weekStart);

    // Filter events for this day
    const dayEvents = calendarEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === dayDate.toDateString();
    });

    // Split into AM/PM
    return {
      am: dayEvents.filter(event => getTimeOfDayFromDate(new Date(event.startTime)) === 'am'),
      pm: dayEvents.filter(event => getTimeOfDayFromDate(new Date(event.startTime)) === 'pm'),
    };
  };

  const handleCreateNextWeek = async () => {
    const newWeek = await createNextWeek();
    setSelectedWeek(newWeek);
  };


  const handleSaveTemplateToAllWeeks = () => {
    const weeks = getAvailableWeeks();
    if (weeks.length === 0) {
      Alert.alert('No Weeks', 'No weeks exist yet. Create a week first to use this feature.');
      return;
    }

    Alert.alert(
      'Update All Weeks',
      `This will update all ${weeks.length} existing week(s) with the current template. This action cannot be undone. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            await updateAllWeeksFromTemplate();
            Alert.alert('Success', `Successfully updated ${weeks.length} week(s) from template!`);
          },
        },
      ]
    );
  };

  const handleOpenAddTaskModal = (dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay) => {
    setSelectedDay(dayOfWeek);
    setSelectedTimeOfDay(timeOfDay);
    setAddTaskModalVisible(true);
  };

  const handleAddTask = async (text: string) => {
    if (selectedDay && selectedTimeOfDay) {
      await addTask(text, selectedDay, selectedTimeOfDay, {
        weekStartDate: selectedWeek,
      });
    }
  };

  const handleReorderTasks = async (reorderedTasks: Task[], dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay) => {
    await reorderTasks(reorderedTasks, dayOfWeek, timeOfDay, selectedWeek);
  };

  const availableWeeks = getAvailableWeeks();
  const viewTitle = selectedWeek === 'template'
    ? 'Template Week'
    : getWeekRangeFromStart(selectedWeek).label;

  return (
    <View style={styles.container}>
      <Header
        wakeUpTime={settings.wakeUpTime}
        showTasks={settings.showTasks}
        showCalendarEvents={settings.showCalendarEvents}
        onToggleShowTasks={toggleShowTasks}
        onToggleShowCalendarEvents={toggleShowCalendarEvents}
        weekTitle={viewTitle}
        isTemplateView={selectedWeek === 'template'}
        onSaveTemplateToAllWeeks={handleSaveTemplateToAllWeeks}
        isCalendarConnected={isCalendarConnected}
        onConnectCalendar={connectGoogleCalendar}
        onDisconnectCalendar={disconnectGoogleCalendar}
      />

      <View style={styles.weekSelectorContainer}>
        <WeekSelector
          availableWeeks={availableWeeks}
          currentWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
          onCreateWeek={handleCreateNextWeek}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {DAYS.map(day => (
          <DayColumn
            key={day}
            dayOfWeek={day}
            tasks={getDayTasks(day)}
            calendarEvents={getDayCalendarEvents(day)}
            onToggleTask={toggleTask}
            getChildTasks={getChildTasksForWeek}
            onAddTask={handleOpenAddTaskModal}
            onReorderTasks={handleReorderTasks}
          />
        ))}
      </ScrollView>

      {addTaskModalVisible && (
        <AddTaskModal
          visible={addTaskModalVisible}
          dayOfWeek={selectedDay}
          timeOfDay={selectedTimeOfDay}
          onClose={() => setAddTaskModalVisible(false)}
          onAdd={handleAddTask}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  weekSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
