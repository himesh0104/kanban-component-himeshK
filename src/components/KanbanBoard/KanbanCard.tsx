import React, { useCallback, useMemo } from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { isOverdue, getInitials, getPriorityColor } from '@/utils/task.utils';
import { format } from 'date-fns';
import clsx from 'clsx';

interface KanbanCardProps {
  task: KanbanTask;
  onEdit: () => void;
  isDragging?: boolean;
  isKeyboardDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onKeyboardDragStart?: () => void;
  theme?: 'light' | 'dark';
  isFocused?: boolean;
  onFocusCard?: () => void;
  registerTaskRef?: (node: HTMLDivElement | null) => void;
  searchQuery?: string;
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text: string, query: string, theme: 'light' | 'dark') => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isMatch = part.toLowerCase() === query.toLowerCase();
    return isMatch ? (
      <mark
        key={i}
        className={clsx(
          'px-0.5 rounded',
          theme === 'dark' ? 'bg-primary-700 text-white' : 'bg-primary-100 text-primary-800'
        )}
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    );
  });
};

export const KanbanCard = React.memo<KanbanCardProps>(({
  task,
  onEdit,
  isDragging = false,
  isKeyboardDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onKeyboardDragStart,
  theme = 'light',
  isFocused = false,
  onFocusCard,
  registerTaskRef,
  searchQuery,
}) => {
  const isDark = theme === 'dark';
  const priorityColor = getPriorityColor(task.priority);
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const query = searchQuery?.trim() ?? '';

  const highlightedTitle = useMemo(
    () => (query ? highlightMatch(task.title, query, theme) : task.title),
    [task.title, query, theme]
  );

  const highlightedDescription = useMemo(
    () => (query && task.description ? highlightMatch(task.description, query, theme) : task.description),
    [task.description, query, theme]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.key === ' ' && e.shiftKey && onKeyboardDragStart) {
          onKeyboardDragStart();
        } else {
          onEdit();
        }
      }
    },
    [onEdit, onKeyboardDragStart]
  );

  const handleClick = useCallback(() => {
    onFocusCard?.();
    onEdit();
  }, [onEdit, onFocusCard]);

  const ariaLabel = `${task.title}. Status: ${task.status}. Priority: ${task.priority || 'none'}. Press space or enter to edit, shift+space to drag.`;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocusCard}
      tabIndex={isFocused ? 0 : -1}
      role="button"
      aria-label={ariaLabel}
      aria-grabbed={isDragging || isKeyboardDragging}
      aria-selected={isFocused}
      ref={registerTaskRef}
      className={clsx(
        'rounded-lg p-3 shadow-card transition-all',
        isDark ? 'bg-neutral-700 text-neutral-100 border border-neutral-600' : 'bg-white',
        isDragging || isKeyboardDragging
          ? 'opacity-50 cursor-grabbing'
          : 'cursor-grab hover:shadow-lg hover:-translate-y-0.5',
        isFocused && 'ring-2 ring-primary-500',
        priorityColor && `border-l-4 ${priorityColor}`
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={clsx('font-medium text-sm line-clamp-2 flex-1', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
          {highlightedTitle}
        </h4>
        {task.priority && (
          <span
            className={clsx(
              'text-xs px-2 py-0.5 rounded ml-2',
              isDark ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
            )}
          >
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p className={clsx('text-xs mb-2 line-clamp-2', isDark ? 'text-neutral-300' : 'text-neutral-600')}>
          {highlightedDescription}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1 flex-wrap">
          {task.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className={clsx(
                'text-xs px-2 py-0.5 rounded',
                isDark ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {task.assignee && (
          <div className="w-6 h-6 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center ml-2 flex-shrink-0">
            {getInitials(task.assignee)}
          </div>
        )}
      </div>

      {task.dueDate && (
        <div className={clsx('text-xs mt-2', overdue ? 'text-error-500' : 'text-neutral-500')}>
          Due: {format(task.dueDate, 'MMM d')}
        </div>
      )}
    </div>
  );
});

KanbanCard.displayName = 'KanbanCard';