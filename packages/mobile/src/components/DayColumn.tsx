import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task, DayOfWeek, TimeOfDay, CalendarEvent, formatTime } from '@task-app/shared';
import { TaskItem } from './TaskItem';

interface DayColumnProps {
  dayOfWeek: DayOfWeek;
  tasks: {
    am: Task[];
    pm: Task[];
  };
  calendarEvents?: {
    am: CalendarEvent[];
    pm: CalendarEvent[];
  };
  onToggleTask: (taskId: string) => void;
  getChildTasks: (parentId: string) => Task[];
  onAddTask?: (dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay) => void;
  onReorderTasks?: (tasks: Task[], dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay) => void;
  onTaskLongPress?: (task: Task) => void;
}

export function DayColumn({ dayOfWeek, tasks, calendarEvents, onToggleTask, getChildTasks, onAddTask, onTaskLongPress }: DayColumnProps) {
  const dayLabel = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  // Combine all tasks and events
  const allTasks = [...tasks.am, ...tasks.pm];
  const allEvents = [...(calendarEvents?.am || []), ...(calendarEvents?.pm || [])];
  const hasContent = allTasks.length > 0 || allEvents.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        {onAddTask && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddTask(dayOfWeek, 'am')}
            activeOpacity={0.6}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Calendar Events */}
        {allEvents.map(event => (
          <View key={event.id} style={styles.calendarEventItem}>
            <Text style={styles.calendarEventTime}>
              {formatTime(new Date(event.startTime))}
            </Text>
            <Text style={styles.calendarEventTitle}>{event.title}</Text>
          </View>
        ))}

        {/* Tasks */}
        {allTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onPress={() => onTaskLongPress?.(task)}
            childTasks={getChildTasks(task.id)}
          />
        ))}

        {/* Empty state */}
        {!hasContent && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  addButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  addButtonText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '300',
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#a3a3a3',
    fontStyle: 'italic',
  },
  calendarEventItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
    borderRadius: 4,
  },
  calendarEventTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  calendarEventTitle: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '400',
  },
});
