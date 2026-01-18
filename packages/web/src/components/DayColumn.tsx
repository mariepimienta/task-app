import React, { useState, useRef, useEffect } from 'react';
import type { Task, DayOfWeek, TimeOfDay } from '../../../shared/src/index';
import { TaskItem } from './TaskItem';
import './DayColumn.css';

interface DayColumnProps {
  dayOfWeek: DayOfWeek;
  tasks: {
    am: Task[];
    pm: Task[];
  };
  onToggleTask: (taskId: string) => void;
  getChildTasks: (parentId: string) => Task[];
  onDropTask?: (taskId: string, dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay, targetIndex?: number) => void;
  onAddTask?: (dayOfWeek: DayOfWeek, timeOfDay: TimeOfDay, title: string) => void;
  onUpdateTaskTitle?: (taskId: string, newTitle: string) => void;
}

export function DayColumn({ dayOfWeek, tasks, onToggleTask, getChildTasks, onDropTask, onAddTask, onUpdateTaskTitle }: DayColumnProps) {
  const dayLabel = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  const [dragOverSection, setDragOverSection] = useState<TimeOfDay | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAddingTask, setIsAddingTask] = useState<{ section: TimeOfDay | null }>({ section: null });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent, timeOfDay: TimeOfDay, taskList: Task[]) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // Set drag over state
    if (dragOverSection !== timeOfDay) {
      setDragOverSection(timeOfDay);
    }

    // Calculate drop index based on mouse Y position
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // Find all task elements
    const taskElements = container.querySelectorAll('.task-item-container');
    let targetIndex = taskList.length; // Default to end

    for (let i = 0; i < taskElements.length; i++) {
      const taskRect = taskElements[i].getBoundingClientRect();
      const taskMiddle = taskRect.top + taskRect.height / 2 - rect.top;

      if (mouseY < taskMiddle) {
        targetIndex = i;
        break;
      }
    }

    setDragOverIndex(targetIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverSection(null);
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, timeOfDay: TimeOfDay) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, dayOfWeek, timeOfDay, dragOverIndex ?? undefined);
    }
    setDragOverSection(null);
    setDragOverIndex(null);
  };

  const handleAddTaskClick = (timeOfDay: TimeOfDay) => {
    setIsAddingTask({ section: timeOfDay });
    setNewTaskTitle('');
  };

  const handleSaveNewTask = (timeOfDay: TimeOfDay) => {
    if (newTaskTitle.trim() && onAddTask) {
      onAddTask(dayOfWeek, timeOfDay, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask({ section: null });
    }
  };

  const handleCancelNewTask = () => {
    setNewTaskTitle('');
    setIsAddingTask({ section: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent, timeOfDay: TimeOfDay) => {
    if (e.key === 'Enter') {
      handleSaveNewTask(timeOfDay);
    } else if (e.key === 'Escape') {
      handleCancelNewTask();
    }
  };

  useEffect(() => {
    if (isAddingTask.section && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTask]);

  return (
    <div className="day-column">
      <div className="day-label">{dayLabel}</div>

      <div
        className={`time-section ${dragOverSection === 'am' ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'am', tasks.am)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'am')}
      >
        <div className="time-label">AM</div>
        {tasks.am.length > 0 ? (
          tasks.am.map((task, index) => (
            <React.Fragment key={task.id}>
              {dragOverSection === 'am' && dragOverIndex === index && (
                <div className="drop-indicator" />
              )}
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                childTasks={getChildTasks(task.id)}
                onUpdateTitle={onUpdateTaskTitle}
              />
            </React.Fragment>
          ))
        ) : (
          !isAddingTask.section && <div className="empty-text">No tasks</div>
        )}
        {dragOverSection === 'am' && dragOverIndex === tasks.am.length && (
          <div className="drop-indicator" />
        )}

        {isAddingTask.section === 'am' ? (
          <div className="add-task-input-container">
            <input
              ref={inputRef}
              type="text"
              className="add-task-input"
              placeholder="Task name..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'am')}
              onBlur={() => handleSaveNewTask('am')}
            />
          </div>
        ) : (
          <button className="add-task-button" onClick={() => handleAddTaskClick('am')}>
            + Add task
          </button>
        )}
      </div>

      <div
        className={`time-section ${dragOverSection === 'pm' ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'pm', tasks.pm)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'pm')}
      >
        <div className="time-label">PM</div>
        {tasks.pm.length > 0 ? (
          tasks.pm.map((task, index) => (
            <React.Fragment key={task.id}>
              {dragOverSection === 'pm' && dragOverIndex === index && (
                <div className="drop-indicator" />
              )}
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                childTasks={getChildTasks(task.id)}
                onUpdateTitle={onUpdateTaskTitle}
              />
            </React.Fragment>
          ))
        ) : (
          !isAddingTask.section && <div className="empty-text">No tasks</div>
        )}
        {dragOverSection === 'pm' && dragOverIndex === tasks.pm.length && (
          <div className="drop-indicator" />
        )}

        {isAddingTask.section === 'pm' ? (
          <div className="add-task-input-container">
            <input
              ref={inputRef}
              type="text"
              className="add-task-input"
              placeholder="Task name..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'pm')}
              onBlur={() => handleSaveNewTask('pm')}
            />
          </div>
        ) : (
          <button className="add-task-button" onClick={() => handleAddTaskClick('pm')}>
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
