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

export function DayColumn({ dayOfWeek, tasks, calendarEvents, onToggleTask, getChildTasks, onAddTask, onReorderTasks, onTaskLongPress }: DayColumnProps) {
  const dayLabel = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.timeLabelRow}>
            <Text style={styles.timeLabel}>AM</Text>
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
          {/* Calendar Events */}
          {calendarEvents?.am.map(event => (
            <View key={event.id} style={styles.calendarEventItem}>
              <Text style={styles.calendarEventTime}>
                {formatTime(new Date(event.startTime))}
              </Text>
              <Text style={styles.calendarEventTitle}>{event.title}</Text>
            </View>
          ))}
          {tasks.am.length > 0 ? (
            tasks.am.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onPress={() => onTaskLongPress?.(task)}
                childTasks={getChildTasks(task.id)}
              />
            ))
          ) : (
            !calendarEvents?.am.length && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.timeLabelRow}>
            <Text style={styles.timeLabel}>PM</Text>
            {onAddTask && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => onAddTask(dayOfWeek, 'pm')}
                activeOpacity={0.6}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Calendar Events */}
          {calendarEvents?.pm.map(event => (
            <View key={event.id} style={styles.calendarEventItem}>
              <Text style={styles.calendarEventTime}>
                {formatTime(new Date(event.startTime))}
              </Text>
              <Text style={styles.calendarEventTitle}>{event.title}</Text>
            </View>
          ))}
          {tasks.pm.length > 0 ? (
            tasks.pm.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onPress={() => onTaskLongPress?.(task)}
                childTasks={getChildTasks(task.id)}
              />
            ))
          ) : (
            !calendarEvents?.pm.length && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks</Text>
              </View>
            )
          )}
        </View>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#737373',
    letterSpacing: 1,
  },
  addButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  addButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#a3a3a3',
    fontStyle: 'italic',
  },
  listContainer: {
    flex: 1,
  },
  calendarEventItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
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
