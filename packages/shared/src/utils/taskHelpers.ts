import type { Task, DayOfWeek, TimeOfDay } from '../types';

export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createTask(
  title: string,
  dayOfWeek: DayOfWeek,
  timeOfDay: TimeOfDay,
  options: {
    recurring?: boolean;
    weeklyRecurrence?: boolean;
    parentTaskId?: string;
    order?: number;
    weekStartDate?: string;
  } = {}
): Task {
  const now = new Date().toISOString();
  return {
    id: generateTaskId(),
    title,
    completed: false,
    dayOfWeek,
    timeOfDay,
    recurring: options.recurring ?? false,
    weeklyRecurrence: options.weeklyRecurrence ?? false,
    parentTaskId: options.parentTaskId,
    order: options.order ?? 0,
    createdAt: now,
    updatedAt: now,
    weekStartDate: options.weekStartDate,
  };
}

export function updateTask(task: Task, updates: Partial<Task>): Task {
  return {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

export function toggleTaskCompletion(task: Task): Task {
  return updateTask(task, { completed: !task.completed });
}

export function sortTasksByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order);
}

export function getTasksByDay(tasks: Task[], dayOfWeek: DayOfWeek): Task[] {
  return tasks.filter(task => task.dayOfWeek === dayOfWeek);
}

export function getTasksByDayAndTime(
  tasks: Task[],
  dayOfWeek: DayOfWeek,
  timeOfDay: TimeOfDay
): Task[] {
  return tasks.filter(
    task => task.dayOfWeek === dayOfWeek && task.timeOfDay === timeOfDay
  );
}

export function getChildTasks(tasks: Task[], parentId: string): Task[] {
  return tasks.filter(task => task.parentTaskId === parentId);
}

export function getRootTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.parentTaskId);
}

export function deleteTask(tasks: Task[], taskId: string): Task[] {
  // Also delete child tasks
  const taskToDelete = tasks.find(t => t.id === taskId);
  if (!taskToDelete) return tasks;

  const childTasks = getChildTasks(tasks, taskId);
  const idsToDelete = [taskId, ...childTasks.map(t => t.id)];

  return tasks.filter(task => !idsToDelete.includes(task.id));
}

export function moveTask(
  task: Task,
  newDayOfWeek: DayOfWeek,
  newTimeOfDay?: TimeOfDay
): Task {
  return updateTask(task, {
    dayOfWeek: newDayOfWeek,
    ...(newTimeOfDay && { timeOfDay: newTimeOfDay }),
  });
}

export function reorderTasks(tasks: Task[]): Task[] {
  return tasks.map((task, index) => updateTask(task, { order: index }));
}

// Get template tasks
export function getTemplateTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.weekStartDate === 'template');
}

// Get tasks for a specific week
export function getTasksForWeek(tasks: Task[], weekStartDate: string): Task[] {
  return tasks.filter(task => task.weekStartDate === weekStartDate);
}

// Create tasks for a new week from template
export function createWeekFromTemplate(templateTasks: Task[], weekStartDate: string): Task[] {
  const newTasks: Task[] = [];
  const parentIdMap = new Map<string, string>(); // old parent ID -> new parent ID

  // First create all root tasks
  const rootTasks = getRootTasks(templateTasks);
  for (const template of rootTasks) {
    const newTask = createTask(template.title, template.dayOfWeek, template.timeOfDay, {
      recurring: template.recurring,
      weeklyRecurrence: template.weeklyRecurrence,
      order: template.order,
      weekStartDate,
    });
    newTasks.push(newTask);
    parentIdMap.set(template.id, newTask.id);
  }

  // Then create all child tasks with updated parent IDs
  const childTasks = templateTasks.filter(task => task.parentTaskId);
  for (const template of childTasks) {
    const newParentId = parentIdMap.get(template.parentTaskId!);
    if (newParentId) {
      const newTask = createTask(template.title, template.dayOfWeek, template.timeOfDay, {
        recurring: template.recurring,
        weeklyRecurrence: template.weeklyRecurrence,
        parentTaskId: newParentId,
        order: template.order,
        weekStartDate,
      });
      newTasks.push(newTask);
    }
  }

  return newTasks;
}
