import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '@task-app/shared';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onPress?: (taskId: string) => void;
  childTasks?: Task[];
  isCalendarEvent?: boolean;
}

export function TaskItem({ task, onToggle, onPress, childTasks = [], isCalendarEvent = false }: TaskItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.taskRow}
        onPress={() => onToggle(task.id)}
        onLongPress={() => onPress?.(task.id)}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxChecked, isCalendarEvent && styles.checkboxCalendar]}>
          {task.completed && <View style={styles.checkmark} />}
        </View>
        <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
          {task.title}
        </Text>
      </TouchableOpacity>

      {childTasks.length > 0 && (
        <View style={styles.childTasks}>
          {childTasks.map(childTask => (
            <TouchableOpacity
              key={childTask.id}
              style={styles.childTaskRow}
              onPress={() => onToggle(childTask.id)}
            >
              <View style={[styles.checkbox, styles.checkboxSmall, childTask.completed && styles.checkboxChecked]}>
                {childTask.completed && <View style={[styles.checkmark, styles.checkmarkSmall]} />}
              </View>
              <Text style={[styles.taskText, styles.childTaskText, childTask.completed && styles.taskTextCompleted]}>
                {childTask.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCalendar: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxSmall: {
    width: 14,
    height: 14,
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  checkmarkSmall: {
    width: 8,
    height: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  taskTextCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  childTasks: {
    marginLeft: 26,
  },
  childTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  childTaskText: {
    fontSize: 13,
  },
});
