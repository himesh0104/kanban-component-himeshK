import React from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { isOverdue, getInitials, getPriorityColor } from '@/utils/task.utils';
import { format } from 'date-fns';
import clsx from 'clsx';

interface KanbanCardProps {
  task: KanbanTask;
  onEdit: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(({
  task,
  onEdit,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const priorityColor = getPriorityColor(task.priority);
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit();
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onEdit}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${task.title}. Status: ${task.status}. Priority: ${task.priority || 'none'}. Press space or enter to edit.`}
      aria-grabbed={isDragging}
      className={clsx(
        'bg-white border rounded-lg p-3 shadow-card hover:shadow-card-hover transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab',
        priorityColor && `border-l-4 ${priorityColor}`
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-neutral-900 line-clamp-2 flex-1">
          {task.title}
        </h4>
        {task.priority && (
          <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 ml-2">
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-neutral-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1 flex-wrap">
          {task.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {task.assignee && (
          <div className="w-6 h-6 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center ml-2">
            {getInitials(task.assignee)}
          </div>
        )}
      </div>

      {task.dueDate && (
        <div
          className={clsx(
            'text-xs mt-2',
            overdue ? 'text-error-500' : 'text-neutral-500'
          )}
        >
          Due: {format(task.dueDate, 'MMM d')}
        </div>
      )}
    </div>
  );
});

