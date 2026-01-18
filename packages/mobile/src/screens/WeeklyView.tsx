import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { DayOfWeek } from '@task-app/shared';
import { useTasks } from '../hooks/useTasks';
import { useSettings } from '../hooks/useSettings';
import { Header } from '../components/Header';
import { DayColumn } from '../components/DayColumn';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function WeeklyView() {
  const { tasks, loading: tasksLoading, toggleTask, addTask, getTasksForDayAndTime, getChildTasksForParent } = useTasks();
  const { settings, loading: settingsLoading, toggleShowTasks, toggleShowCalendarEvents } = useSettings();

  if (tasksLoading || settingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const getDayTasks = (day: DayOfWeek) => ({
    am: settings.showTasks ? getTasksForDayAndTime(day, 'am') : [],
    pm: settings.showTasks ? getTasksForDayAndTime(day, 'pm') : [],
  });

  const handleAddSampleTask = async () => {
    await addTask('New Task', 'monday', 'am', { recurring: false });
  };

  return (
    <View style={styles.container}>
      <Header
        wakeUpTime={settings.wakeUpTime}
        showTasks={settings.showTasks}
        showCalendarEvents={settings.showCalendarEvents}
        onToggleShowTasks={toggleShowTasks}
        onToggleShowCalendarEvents={toggleShowCalendarEvents}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.daysContainer}>
          {DAYS.map(day => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              tasks={getDayTasks(day)}
              onToggleTask={toggleTask}
              getChildTasks={getChildTasksForParent}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSampleTask}>
          <Text style={styles.addButtonText}>+ Add Task (Monday AM)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
