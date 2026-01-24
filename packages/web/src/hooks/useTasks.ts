import { useState, useEffect, useCallback } from 'react';
import {
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask as deleteTaskHelper,
  sortTasksByOrder,
  getTasksByDayAndTime,
  getRootTasks,
  getChildTasks,
  generateSampleTasks,
  getTemplateTasks,
  createWeekFromTemplate,
  getCurrentWeekStart,
  getNextWeekStart,
} from '../../../shared/src/index';
import type {
  Task,
  DayOfWeek,
  TimeOfDay,
} from '../../../shared/src/index';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';

const storage = new LocalStorageAdapter();

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const loadedTasks = await storage.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      await storage.saveTasks(newTasks);
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, []);

  const addTask = useCallback(
    async (
      title: string,
      dayOfWeek: DayOfWeek,
      timeOfDay: TimeOfDay,
      options?: { parentTaskId?: string; recurring?: boolean; weekStartDate?: string }
    ) => {
      const newTask = createTask(title, dayOfWeek, timeOfDay, {
        parentTaskId: options?.parentTaskId,
        recurring: options?.recurring,
        weekStartDate: options?.weekStartDate,
        order: tasks.length,
      });
      await saveTasks([...tasks, newTask]);
    },
    [tasks, saveTasks]
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? toggleTaskCompletion(task) : task
      );
      await saveTasks(updatedTasks);
    },
    [tasks, saveTasks]
  );

  const updateTaskDetails = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? updateTask(task, updates) : task
      );
      await saveTasks(updatedTasks);
    },
    [tasks, saveTasks]
  );

  const updateTaskTitle = useCallback(
    async (taskId: string, newTitle: string) => {
      await updateTaskDetails(taskId, { title: newTitle });
    },
    [updateTaskDetails]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const updatedTasks = deleteTaskHelper(tasks, taskId);
      await saveTasks(updatedTasks);
    },
    [tasks, saveTasks]
  );

  const getTasksForDayAndTime = useCallback(
    (dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay) => {
      const dayTasks = getTasksByDayAndTime(tasks, dayOfWeek, timeOfDay);
      const rootTasks = getRootTasks(dayTasks);
      return sortTasksByOrder(rootTasks);
    },
    [tasks]
  );

  const getChildTasksForParent = useCallback(
    (parentId: string) => {
      const childTasks = getChildTasks(tasks, parentId);
      return sortTasksByOrder(childTasks);
    },
    [tasks]
  );

  const loadSampleData = useCallback(async () => {
    const sampleTasks = generateSampleTasks();
    await saveTasks(sampleTasks);
  }, [saveTasks]);

  const moveTask = useCallback(
    async (taskId: string, newDayOfWeek: DayOfWeek, newTimeOfDay: TimeOfDay, targetIndex?: number) => {
      // Get the task being moved and its children
      const movedTask = tasks.find(t => t.id === taskId);
      if (!movedTask) return;

      const childTaskIds = tasks.filter(t => t.parentTaskId === taskId).map(t => t.id);
      const allMovedIds = [taskId, ...childTaskIds];

      // Get all tasks in the target day/time (excluding the moved tasks)
      const targetTasks = tasks
        .filter(t =>
          t.dayOfWeek === newDayOfWeek &&
          t.timeOfDay === newTimeOfDay &&
          !t.parentTaskId && // Only root tasks
          !allMovedIds.includes(t.id)
        )
        .sort((a, b) => a.order - b.order);

      // Insert the moved task at the target index
      const finalIndex = targetIndex !== undefined ? targetIndex : targetTasks.length;
      targetTasks.splice(finalIndex, 0, movedTask);

      // Reassign order values sequentially
      const orderMap = new Map<string, number>();
      targetTasks.forEach((task, index) => {
        orderMap.set(task.id, index);
      });

      // Update all tasks
      const updatedTasks = tasks.map(task => {
        // Update the moved task and its children
        if (allMovedIds.includes(task.id)) {
          return updateTask(task, {
            dayOfWeek: newDayOfWeek,
            timeOfDay: newTimeOfDay,
            order: task.id === taskId ? (orderMap.get(taskId) ?? task.order) : task.order,
            updatedAt: new Date().toISOString(),
          });
        }
        // Update order for other tasks in the target section
        if (task.dayOfWeek === newDayOfWeek && task.timeOfDay === newTimeOfDay && !task.parentTaskId) {
          const newOrder = orderMap.get(task.id);
          if (newOrder !== undefined) {
            return updateTask(task, { order: newOrder });
          }
        }
        return task;
      });

      await saveTasks(updatedTasks);
    },
    [tasks, saveTasks]
  );

  const getAvailableWeeks = useCallback(() => {
    const weeks = new Set<string>();
    tasks.forEach(task => {
      if (task.weekStartDate && task.weekStartDate !== 'template') {
        weeks.add(task.weekStartDate);
      }
    });
    return Array.from(weeks).sort();
  }, [tasks]);

  const createNewWeek = useCallback(
    async (weekStartDate: string) => {
      const templateTasks = getTemplateTasks(tasks);
      const newWeekTasks = createWeekFromTemplate(templateTasks, weekStartDate);
      await saveTasks([...tasks, ...newWeekTasks]);
      return weekStartDate;
    },
    [tasks, saveTasks]
  );

  const createNextWeek = useCallback(async () => {
    const weeks = getAvailableWeeks();
    const latestWeek = weeks.length > 0 ? weeks[weeks.length - 1] : getCurrentWeekStart();
    const nextWeek = getNextWeekStart(latestWeek);
    return await createNewWeek(nextWeek);
  }, [getAvailableWeeks, createNewWeek]);

  const ensureCurrentWeekExists = useCallback(async () => {
    const currentWeek = getCurrentWeekStart();
    const weeks = getAvailableWeeks();
    if (!weeks.includes(currentWeek)) {
      await createNewWeek(currentWeek);
    }
  }, [getAvailableWeeks, createNewWeek]);

  const deleteWeek = useCallback(
    async (weekStartDate: string) => {
      // Don't allow deleting the template
      if (weekStartDate === 'template') {
        return;
      }
      // Filter out all tasks for this week
      const updatedTasks = tasks.filter(task => task.weekStartDate !== weekStartDate);
      await saveTasks(updatedTasks);
    },
    [tasks, saveTasks]
  );

  const updateAllWeeksFromTemplate = useCallback(
    async () => {
      const templateTasks = getTemplateTasks(tasks);
      const currentWeekStart = getCurrentWeekStart();

      // Keep only: template tasks + past week tasks
      const tasksToKeep = tasks.filter(task =>
        task.weekStartDate === 'template' ||
        (task.weekStartDate && task.weekStartDate < currentWeekStart)
      );

      // Recreate current week from template
      const currentWeekTasks = createWeekFromTemplate(templateTasks, currentWeekStart);

      // Save: template + past weeks + new current week
      await saveTasks([...tasksToKeep, ...currentWeekTasks]);
      return 1;
    },
    [tasks, saveTasks]
  );

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    updateTaskDetails,
    updateTaskTitle,
    deleteTask,
    moveTask,
    getTasksForDayAndTime,
    getChildTasksForParent,
    loadSampleData,
    getAvailableWeeks,
    createNewWeek,
    createNextWeek,
    ensureCurrentWeekExists,
    deleteWeek,
    updateAllWeeksFromTemplate,
  };
}
