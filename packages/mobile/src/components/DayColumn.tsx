import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task, DayOfWeek, TimeOfDay } from '@task-app/shared';
import { TaskItem } from './TaskItem';

interface DayColumnProps {
  dayOfWeek: DayOfWeek;
  tasks: {
    am: Task[];
    pm: Task[];
  };
  onToggleTask: (taskId: string) => void;
  getChildTasks: (parentId: string) => Task[];
}

export function DayColumn({ dayOfWeek, tasks, onToggleTask, getChildTasks }: DayColumnProps) {
  const dayLabel = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <View style={styles.container}>
      <Text style={styles.dayLabel}>{dayLabel}</Text>

      <View style={styles.section}>
        <Text style={styles.timeLabel}>AM</Text>
        {tasks.am.length > 0 ? (
          tasks.am.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              childTasks={getChildTasks(task.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.timeLabel}>PM</Text>
        {tasks.pm.length > 0 ? (
          tasks.pm.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              childTasks={getChildTasks(task.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  section: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
