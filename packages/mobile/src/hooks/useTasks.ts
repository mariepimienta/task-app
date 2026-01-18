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
      options?: { parentTaskId?: string; recurring?: boolean }
    ) => {
      const newTask = createTask(title, dayOfWeek, timeOfDay, {
        parentTaskId: options?.parentTaskId,
        recurring: options?.recurring,
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
  };
}
