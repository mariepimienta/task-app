import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { LayoutRectangle, ScrollView, View } from 'react-native';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { Task, DayOfWeek } from '@task-app/shared';

// Auto-scroll configuration
const SCROLL_EDGE_THRESHOLD = 100;
const SCROLL_SPEED = 8;
const SCROLL_INTERVAL = 16;

interface DragContextState {
  draggedTask: Task | null;
  targetDay: DayOfWeek | null;
  isDragging: boolean;
}

interface DragContextValue extends DragContextState {
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  isDraggingShared: SharedValue<boolean>;
  startDrag: (task: Task, x: number, y: number) => void;
  updatePosition: (x: number, y: number) => void;
  endDrag: () => void;
  registerDayColumn: (day: DayOfWeek, ref: View | null) => void;
  setScrollViewRef: (ref: ScrollView | null) => void;
  setScrollViewLayout: (layout: { y: number; height: number }) => void;
}

const DragContext = createContext<DragContextValue | null>(null);

interface DragProviderProps {
  children: ReactNode;
  onMoveTask?: (taskId: string, newDay: DayOfWeek) => void;
}

export function DragProvider({ children, onMoveTask }: DragProviderProps) {
  const [state, setState] = useState<DragContextState>({
    draggedTask: null,
    targetDay: null,
    isDragging: false,
  });

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDraggingShared = useSharedValue(false);

  // Store refs to day columns for real-time measurement
  const dayColumnRefs = useRef<Map<DayOfWeek, View>>(new Map());

  // Scroll-related refs
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollViewLayout = useRef({ y: 0, height: 0 });
  const scrollOffset = useRef(0);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const currentDragY = useRef(0);

  const startAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) return;

    autoScrollInterval.current = setInterval(() => {
      if (!scrollViewRef.current) return;

      const y = currentDragY.current;
      const { y: scrollViewTop, height: scrollViewHeight } = scrollViewLayout.current;
      const relativeY = y - scrollViewTop;

      let scrollDelta = 0;

      if (relativeY > scrollViewHeight - SCROLL_EDGE_THRESHOLD) {
        scrollDelta = SCROLL_SPEED;
      } else if (relativeY < SCROLL_EDGE_THRESHOLD) {
        scrollDelta = -SCROLL_SPEED;
      }

      if (scrollDelta !== 0) {
        const newOffset = Math.max(0, scrollOffset.current + scrollDelta);
        scrollOffset.current = newOffset;
        scrollViewRef.current.scrollTo({ y: newOffset, animated: false });
      }
    }, SCROLL_INTERVAL);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  // Find which day column the Y position is over by measuring in real-time
  const findTargetDay = useCallback((y: number): DayOfWeek | null => {
    let foundDay: DayOfWeek | null = null;

    dayColumnRefs.current.forEach((ref, day) => {
      ref.measureInWindow((x, colY, width, height) => {
        if (y >= colY && y <= colY + height) {
          foundDay = day;
        }
      });
    });

    // measureInWindow is async, so we need a synchronous fallback
    // We'll update state in the next tick
    return foundDay;
  }, []);

  // Measure all columns and update target day
  const updateTargetDay = useCallback((y: number) => {
    const promises: Promise<{ day: DayOfWeek; top: number; bottom: number }>[] = [];

    dayColumnRefs.current.forEach((ref, day) => {
      promises.push(
        new Promise((resolve) => {
          ref.measureInWindow((x, colY, width, height) => {
            resolve({ day, top: colY, bottom: colY + height });
          });
        })
      );
    });

    Promise.all(promises).then((measurements) => {
      let newTargetDay: DayOfWeek | null = null;
      for (const { day, top, bottom } of measurements) {
        if (y >= top && y <= bottom) {
          newTargetDay = day;
          break;
        }
      }

      setState(prev => {
        if (prev.targetDay !== newTargetDay) {
          return { ...prev, targetDay: newTargetDay };
        }
        return prev;
      });
    });
  }, []);

  const startDrag = useCallback((task: Task, x: number, y: number) => {
    dragX.value = x;
    dragY.value = y;
    isDraggingShared.value = true;
    currentDragY.current = y;

    setState({
      draggedTask: task,
      isDragging: true,
      targetDay: task.dayOfWeek,
    });

    startAutoScroll();
  }, [dragX, dragY, isDraggingShared, startAutoScroll]);

  const updatePosition = useCallback((x: number, y: number) => {
    dragX.value = x;
    dragY.value = y;
    currentDragY.current = y;

    // Update target day based on current finger position
    updateTargetDay(y);
  }, [dragX, dragY, updateTargetDay]);

  const endDrag = useCallback(() => {
    isDraggingShared.value = false;
    stopAutoScroll();

    setState(prev => {
      if (prev.isDragging && prev.draggedTask && prev.targetDay) {
        if (prev.targetDay !== prev.draggedTask.dayOfWeek && onMoveTask) {
          onMoveTask(prev.draggedTask.id, prev.targetDay);
        }
      }
      return {
        draggedTask: null,
        targetDay: null,
        isDragging: false,
      };
    });
  }, [isDraggingShared, onMoveTask, stopAutoScroll]);

  const registerDayColumn = useCallback((day: DayOfWeek, ref: View | null) => {
    if (ref) {
      dayColumnRefs.current.set(day, ref);
    } else {
      dayColumnRefs.current.delete(day);
    }
  }, []);

  const setScrollViewRef = useCallback((ref: ScrollView | null) => {
    scrollViewRef.current = ref;
  }, []);

  const setScrollViewLayout = useCallback((layout: { y: number; height: number }) => {
    scrollViewLayout.current = layout;
  }, []);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  const value: DragContextValue = {
    ...state,
    dragX,
    dragY,
    isDraggingShared,
    startDrag,
    updatePosition,
    endDrag,
    registerDayColumn,
    setScrollViewRef,
    setScrollViewLayout,
  };

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
}
