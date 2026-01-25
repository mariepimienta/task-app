import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useDrag } from '../contexts/DragContext';

const OVERLAY_WIDTH = Dimensions.get('window').width - 64;
const TASK_HEIGHT = 50;

export function DragOverlay() {
  const { isDragging, draggedTask, dragX, dragY, isDraggingShared } = useDrag();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: dragX.value - OVERLAY_WIDTH / 2 },
        { translateY: dragY.value - TASK_HEIGHT / 2 },
        { scale: isDraggingShared.value ? 1.02 : 1 },
      ],
      opacity: withTiming(isDraggingShared.value ? 1 : 0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      }),
    };
  });

  if (!draggedTask) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none">
      <View style={styles.taskContainer}>
        <View style={[styles.checkbox, draggedTask.completed && styles.checkboxChecked]}>
          {draggedTask.completed && <View style={styles.checkmark} />}
        </View>
        <Text style={[styles.taskText, draggedTask.completed && styles.taskTextCompleted]} numberOfLines={1}>
          {draggedTask.title}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: OVERLAY_WIDTH,
    zIndex: 9999,
    elevation: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
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
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  taskText: {
    fontSize: 15,
    color: '#171717',
    flex: 1,
    fontWeight: '500',
  },
  taskTextCompleted: {
    color: '#a3a3a3',
    textDecorationLine: 'line-through',
  },
});
