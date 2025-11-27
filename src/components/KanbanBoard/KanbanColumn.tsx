import React, { useCallback } from 'react';
import { KanbanColumn as ColumnType, KanbanTask } from './KanbanBoard.types';
import { KanbanCard } from './KanbanCard';
import clsx from 'clsx';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: KanbanTask[];
  onAddTask: () => void;
  onTaskClick: (task: KanbanTask) => void;
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
        'flex flex-col w-80 bg-neutral-100 rounded-lg p-4',
        isDragOver && 'bg-neutral-200 ring-2 ring-primary-500'
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="region"
      aria-label={`${column.title} column. ${tasks.length} tasks.`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-900">{column.title}</h3>
        <span className="text-sm text-neutral-600" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 min-h-[400px] space-y-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-neutral-500 text-sm py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task, index) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={() => onTaskClick(task)}
              isDragging={draggedTaskId === task.id}
              onDragStart={onTaskDragStart ? (e) => onTaskDragStart(e, task.id) : undefined}
              onDragEnd={onTaskDragEnd}
            />
          ))
        )}
      </div>
      
      <button
        onClick={onAddTask}
        className="mt-4 text-sm text-neutral-600 hover:text-neutral-900 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        aria-label={`Add task to ${column.title} column`}
      >
        + Add task
      </button>
    </div>
  );
});

