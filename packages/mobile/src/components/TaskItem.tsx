import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task } from '@task-app/shared';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  childTasks?: Task[];
  isCalendarEvent?: boolean;
}

export function TaskItem({ task, onToggle, onEdit, onDelete, childTasks = [], isCalendarEvent = false }: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteActionContainer, { opacity }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete?.(task.id);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  const renderChildRightActions = (
    childTask: Task,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteActionContainer, { opacity }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={styles.deleteButtonSmall}
            onPress={() => onDelete?.(childTask.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIconSmall}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={onDelete ? renderRightActions : undefined}
        rightThreshold={30}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
          onLongPress={() => onEdit?.(task)}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, task.completed && styles.checkboxChecked, isCalendarEvent && styles.checkboxCalendar]}>
            {task.completed && <View style={styles.checkmark} />}
          </View>
          <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
            {task.title}
          </Text>
        </TouchableOpacity>
      </Swipeable>

      {childTasks.length > 0 && (
        <View style={styles.childTasks}>
          {childTasks.map(childTask => (
            <Swipeable
              key={childTask.id}
              renderRightActions={onDelete ? (progress, dragX) => renderChildRightActions(childTask, progress) : undefined}
              rightThreshold={30}
              overshootRight={false}
              friction={2}
            >
              <TouchableOpacity
                style={styles.childTaskRow}
                onPress={() => onToggle(childTask.id)}
                onLongPress={() => onEdit?.(childTask)}
                delayLongPress={300}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, styles.checkboxSmall, childTask.completed && styles.checkboxChecked]}>
                  {childTask.completed && <View style={[styles.checkmark, styles.checkmarkSmall]} />}
                </View>
                <Text style={[styles.taskText, styles.childTaskText, childTask.completed && styles.taskTextCompleted]}>
                  {childTask.title}
                </Text>
              </TouchableOpacity>
            </Swipeable>
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
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkboxCalendar: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  checkmarkSmall: {
    width: 8,
    height: 8,
  },
  taskText: {
    fontSize: 15,
    color: '#171717',
    flex: 1,
    fontWeight: '400',
  },
  taskTextCompleted: {
    color: '#a3a3a3',
    textDecorationLine: 'line-through',
  },
  childTasks: {
    marginLeft: 32,
  },
  childTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  childTaskText: {
    fontSize: 14,
  },
  deleteActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  deleteIconSmall: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
});
