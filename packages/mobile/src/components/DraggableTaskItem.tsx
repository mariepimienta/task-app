import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Task } from '@task-app/shared';
import { TaskItem } from './TaskItem';
import { useDrag } from '../contexts/DragContext';

const DRAG_THRESHOLD = 10;

interface DraggableTaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  childTasks?: Task[];
}

export function DraggableTaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  childTasks = [],
}: DraggableTaskItemProps) {
  const { startDrag, updatePosition, endDrag, isDragging, draggedTask } = useDrag();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasStartedDrag = useSharedValue(false);

  const isBeingDragged = isDragging && draggedTask?.id === task.id;

  const handleDragStart = useCallback((x: number, y: number) => {
    startDrag(task, x, y);
  }, [startDrag, task]);

  const handleDragUpdate = useCallback((x: number, y: number) => {
    updatePosition(x, y);
  }, [updatePosition]);

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleEditTask = useCallback(() => {
    onEdit?.(task);
  }, [onEdit, task]);

  const pan = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      'worklet';
      // Long press activated - show visual feedback
      hasStartedDrag.value = false;
      scale.value = withTiming(1.02, { duration: 100 });
    })
    .onUpdate((e) => {
      'worklet';
      const dx = Math.abs(e.translationX);
      const dy = Math.abs(e.translationY);

      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        if (!hasStartedDrag.value) {
          // First time crossing threshold - start the drag
          hasStartedDrag.value = true;
          opacity.value = 0.4;
          runOnJS(handleDragStart)(e.absoluteX, e.absoluteY);
        } else {
          // Already dragging - just update position
          runOnJS(handleDragUpdate)(e.absoluteX, e.absoluteY);
        }
      }
    })
    .onEnd((e) => {
      'worklet';
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });

      if (hasStartedDrag.value) {
        // Was dragging - end the drag
        runOnJS(handleDragEnd)();
      } else {
        // Long press without movement - open edit modal
        runOnJS(handleEditTask)();
      }

      hasStartedDrag.value = false;
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
      hasStartedDrag.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.container, animatedStyle, isBeingDragged && styles.dragging]}
      >
        <TaskItem
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          childTasks={childTasks}
          disableLongPress
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  dragging: {
    zIndex: 1000,
  },
});
