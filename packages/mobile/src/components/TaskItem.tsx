import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task } from '@task-app/shared';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  childTasks?: Task[];
  isCalendarEvent?: boolean;
  disableLongPress?: boolean;
}

export function TaskItem({ task, onToggle, onEdit, onDelete, childTasks = [], isCalendarEvent = false, disableLongPress = false }: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete?.(task.id);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>×</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={onDelete ? renderRightActions : undefined}
        rightThreshold={40}
        overshootRight={false}
        containerStyle={styles.swipeableContainer}
      >
        <TouchableOpacity
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
          onLongPress={disableLongPress ? undefined : () => onEdit?.(task)}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, task.completed && styles.checkboxChecked, isCalendarEvent && styles.checkboxCalendar]}>
            {task.completed && <View style={styles.checkmark} />}
          </View>
          <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]} numberOfLines={2}>
            {task.title}
          </Text>
        </TouchableOpacity>
      </Swipeable>

      {childTasks.length > 0 && (
        <View style={styles.childTasks}>
          {childTasks.map(childTask => {
            const childSwipeableRef = React.createRef<Swipeable>();
            return (
              <Swipeable
                key={childTask.id}
                ref={childSwipeableRef}
                renderRightActions={onDelete ? () => (
                  <TouchableOpacity
                    style={styles.deleteActionSmall}
                    onPress={() => {
                      childSwipeableRef.current?.close();
                      onDelete?.(childTask.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.deleteButtonSmall}>
                      <Text style={styles.deleteIconSmall}>×</Text>
                    </View>
                  </TouchableOpacity>
                ) : undefined}
                rightThreshold={40}
                overshootRight={false}
                containerStyle={styles.swipeableContainer}
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
                  <Text style={[styles.taskText, styles.childTaskText, childTask.completed && styles.taskTextCompleted]} numberOfLines={2}>
                    {childTask.title}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  swipeableContainer: {
    overflow: 'visible',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    paddingRight: 12,
    backgroundColor: '#ffffff',
    minHeight: 44,
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
    flexShrink: 0,
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
    paddingRight: 12,
    backgroundColor: '#ffffff',
    minHeight: 36,
  },
  childTaskText: {
    fontSize: 14,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 1,
    borderLeftColor: '#fecaca',
  },
  deleteActionSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 1,
    borderLeftColor: '#fecaca',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '400',
    marginTop: -1,
  },
  deleteIconSmall: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '400',
    marginTop: -1,
  },
});
