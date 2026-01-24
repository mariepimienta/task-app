import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  DayOfWeek,
  TimeOfDay,
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
} from '@task-app/shared';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

const storage = new AsyncStorageAdapter();

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await storage.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await storage.saveTasks(newTasks);
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

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
    [tasks]
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? toggleTaskCompletion(task) : task
      );
      await saveTasks(updatedTasks);
    },
    [tasks]
  );

  const updateTaskDetails = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? updateTask(task, updates) : task
      );
      await saveTasks(updatedTasks);
    },
    [tasks]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const updatedTasks = deleteTaskHelper(tasks, taskId);
      await saveTasks(updatedTasks);
    },
    [tasks]
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
  }, []);

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
    [tasks]
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
      if (weekStartDate === 'template') {
        return;
      }
      const updatedTasks = tasks.filter(task => task.weekStartDate !== weekStartDate);
      await saveTasks(updatedTasks);
    },
    [tasks]
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
    [tasks]
  );

  const reorderTasks = useCallback(
    async (reorderedTasks: Task[], dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay, weekStartDate: string | 'template') => {
      // Update the order property of the reordered tasks
      const tasksWithNewOrder = reorderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      // Get all other tasks that shouldn't be affected
      const otherTasks = tasks.filter(
        task =>
          !(task.dayOfWeek === dayOfWeek &&
            task.timeOfDay === timeOfDay &&
            task.weekStartDate === weekStartDate &&
            !task.parentTaskId)
      );

      // Combine and save
      await saveTasks([...otherTasks, ...tasksWithNewOrder]);
    },
    [tasks]
  );

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    updateTaskDetails,
    deleteTask,
    getTasksForDayAndTime,
    getChildTasksForParent,
    loadSampleData,
    getAvailableWeeks,
    createNewWeek,
    createNextWeek,
    ensureCurrentWeekExists,
    deleteWeek,
    updateAllWeeksFromTemplate,
    reorderTasks,
  };
}
