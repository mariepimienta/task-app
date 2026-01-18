import { Task, DayOfWeek, TimeOfDay } from '../types';
import { createTask } from './taskHelpers';
import { getCurrentWeekStart } from './dateHelpers';

export function generateSampleTasks(): Task[] {
  const tasks: Task[] = [];
  const currentWeek = getCurrentWeekStart();

  // Monday AM
  tasks.push(createTask('Gym / Flow 6am', 'monday', 'am', { recurring: true, weeklyRecurrence: true, order: 0, weekStartDate: currentWeek }));

  // Monday PM
  const washTask = createTask('Wash and dry hair', 'monday', 'pm', { order: 1, weekStartDate: currentWeek });
  tasks.push(washTask);

  const clothesTask = createTask('Put away dried clothes', 'monday', 'pm', { order: 2, weekStartDate: currentWeek });
  tasks.push(clothesTask);

  tasks.push(createTask('Vacuum', 'monday', 'pm', { order: 3, weekStartDate: currentWeek }));

  const findTask = createTask('Find', 'monday', 'pm', { order: 4, weekStartDate: currentWeek });
  tasks.push(findTask);

  // Subtasks for "Find"
  tasks.push(createTask('Coworking spaces', 'monday', 'pm', { parentTaskId: findTask.id, order: 5, weekStartDate: currentWeek }));
  tasks.push(createTask('Volunteer events', 'monday', 'pm', { parentTaskId: findTask.id, order: 6, weekStartDate: currentWeek }));
  tasks.push(createTask('Regular events (broadway shows, book clubs)', 'monday', 'pm', { parentTaskId: findTask.id, order: 7, weekStartDate: currentWeek }));
  tasks.push(createTask('Outside hobbies (pottery)', 'monday', 'pm', { parentTaskId: findTask.id, order: 8, weekStartDate: currentWeek }));

  // Tuesday AM
  tasks.push(createTask('Gym / Killer Cycle 6am', 'tuesday', 'am', { recurring: true, weeklyRecurrence: true, order: 9, weekStartDate: currentWeek }));

  // Tuesday PM
  tasks.push(createTask('Weekly Cleanup pt 1', 'tuesday', 'pm', { recurring: true, weeklyRecurrence: true, order: 10, weekStartDate: currentWeek }));
  tasks.push(createTask('To-do', 'tuesday', 'pm', { order: 11, weekStartDate: currentWeek }));

  // Wednesday AM
  tasks.push(createTask('Walk with Aly', 'wednesday', 'am', { recurring: true, weeklyRecurrence: true, order: 12, weekStartDate: currentWeek }));

  // Thursday AM
  tasks.push(createTask('Gym / UFC Killer Cycle 6am', 'thursday', 'am', { recurring: true, weeklyRecurrence: true, order: 13, weekStartDate: currentWeek }));

  // Thursday PM
  tasks.push(createTask('Weekly Cleanup Pt 2', 'thursday', 'pm', { recurring: true, weeklyRecurrence: true, order: 14, weekStartDate: currentWeek }));
  tasks.push(createTask('Register car', 'thursday', 'pm', { order: 15, weekStartDate: currentWeek }));
  tasks.push(createTask('Look at target thing', 'thursday', 'pm', { order: 16, weekStartDate: currentWeek }));
  tasks.push(createTask('Move Nissan apt', 'thursday', 'pm', { order: 17, weekStartDate: currentWeek }));

  // Friday AM
  tasks.push(createTask('Cycle Bar', 'friday', 'am', { recurring: true, weeklyRecurrence: true, order: 18, weekStartDate: currentWeek }));
  tasks.push(createTask('Weekly Cleanup Pt 2', 'friday', 'am', { recurring: true, weeklyRecurrence: true, order: 19, weekStartDate: currentWeek }));

  // Friday PM
  tasks.push(createTask('Yoga Joint (5pm)', 'friday', 'pm', { recurring: true, weeklyRecurrence: true, order: 20, weekStartDate: currentWeek }));

  // Mark some tasks as completed (like in the mockup)
  tasks[0].completed = true; // Gym / Flow 6am
  tasks[9].completed = true; // Gym / Killer Cycle 6am
  tasks[12].completed = true; // Walk with Aly
  tasks[13].completed = true; // Gym / UFC Killer Cycle 6am
  tasks[18].completed = true; // Cycle Bar
  tasks[19].completed = true; // Weekly Cleanup Pt 2

  return tasks;
}
