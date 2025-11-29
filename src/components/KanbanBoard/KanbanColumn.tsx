import React from 'react';
import { KanbanColumn as ColumnType, KanbanTask } from './KanbanBoard.types';
import { KanbanCard } from './KanbanCard';
import clsx from 'clsx';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: KanbanTask[];
  onAddTask: () => void;
  onTaskClick: (task: KanbanTask) => void;
  theme?: "light" | "dark";
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onTaskDragStart?: (e: React.DragEvent, taskId: string) => void;
  onTaskDragEnd?: () => void;
  draggedTaskId?: string | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
  column,
  tasks,
  onAddTask,
  onTaskClick,
  theme = 'light',
  isDragOver = false,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  draggedTaskId,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col min-w-[20rem] flex-shrink-0 rounded-lg p-4 shadow-sm transition-all',
        theme === 'dark'
          ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
          : 'bg-neutral-100 text-neutral-900 border border-transparent',
        isDragOver && 'ring-2 ring-primary-500 transform scale-[1.01]'
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="region"
      aria-label={`${column.title} column. ${tasks.length} tasks.`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <span className={clsx('text-sm', theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600')} aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 min-h-[320px] space-y-2 overflow-y-auto px-1">
        {tasks.length === 0 ? (
          <div className={clsx('text-center text-sm py-8', theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500')}>
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={() => onTaskClick(task)}
              isDragging={draggedTaskId === task.id}
              onDragStart={onTaskDragStart ? (e) => onTaskDragStart(e, task.id) : undefined}
              onDragEnd={onTaskDragEnd}
              theme={theme}
            />
          ))
        )}
      </div>
      
      <button
        onClick={onAddTask}
        className={clsx('mt-4 text-sm py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded', theme === 'dark' ? 'text-neutral-300 hover:text-neutral-100' : 'text-neutral-600 hover:text-neutral-900')}
        aria-label={`Add task to ${column.title} column`}
      >
        + Add task
      </button>
    </div>
  );
});