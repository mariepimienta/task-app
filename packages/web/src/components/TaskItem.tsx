import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../../../shared/src/index';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onPress?: (taskId: string) => void;
  childTasks?: Task[];
  isCalendarEvent?: boolean;
  onDragStart?: (taskId: string) => void;
  onUpdateTitle?: (taskId: string, newTitle: string) => void;
}

export function TaskItem({ task, onToggle, onPress, childTasks = [], isCalendarEvent = false, onDragStart, onUpdateTitle }: TaskItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart?.(task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCalendarEvent && onUpdateTitle) {
      setIsEditing(true);
      setEditValue(task.title);
    }
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== task.title && onUpdateTitle) {
      onUpdateTitle(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="task-item-container">
      <div
        className={`task-row ${isDragging ? 'dragging' : ''}`}
        draggable={!isCalendarEvent && !task.parentTaskId && !isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => {
          // Don't toggle if we're editing or starting a drag
          if (!isDragging && !isEditing) {
            onToggle(task.id);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onPress?.(task.id);
        }}
      >
        <div
          className={`checkbox ${task.completed ? 'checked' : ''} ${isCalendarEvent ? 'calendar' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isEditing) {
              onToggle(task.id);
            }
          }}
        >
          {task.completed && <div className="checkmark" />}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`task-text ${task.completed ? 'completed' : ''}`}
            onDoubleClick={handleDoubleClick}
          >
            {task.title}
          </span>
        )}
      </div>

      {childTasks.length > 0 && (
        <div className="child-tasks">
          {childTasks.map(childTask => (
            <div
              key={childTask.id}
              className="child-task-row"
              onClick={() => onToggle(childTask.id)}
            >
              <div className={`checkbox checkbox-small ${childTask.completed ? 'checked' : ''}`}>
                {childTask.completed && <div className="checkmark checkmark-small" />}
              </div>
              <span className={`task-text child-task-text ${childTask.completed ? 'completed' : ''}`}>
                {childTask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
