import React, { useMemo } from 'react';
import { KanbanColumn as ColumnType, KanbanTask } from './KanbanBoard.types';
import { KanbanCard } from './KanbanCard';
import { useVirtualizedList } from '@/hooks/useVirtualizedList';
import clsx from 'clsx';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: KanbanTask[];
  onAddTask: () => void;
  onTaskClick: (task: KanbanTask) => void;
  theme?: 'light' | 'dark';
  isDragOver?: boolean;
  dragOverIndex?: number | null;
  onDragOver?: (e: React.DragEvent) => void;
  onTaskDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent) => void;
  onTaskDragStart?: (e: React.DragEvent, taskId: string) => void;
  onTaskDragEnd?: () => void;
  draggedTaskId?: string | null;
  keyboardDrag?: {
    isDragging: boolean;
    draggedTaskId: string | null;
    targetColumnId: string | null;
    targetIndex: number | null;
    startDrag: (taskId: string) => void;
  };
  searchQuery?: string;
}

const WIP_WARNING_THRESHOLD = 0.8;
const VIRTUALIZATION_THRESHOLD = 20;
const ESTIMATED_CARD_HEIGHT = 120;

const getWipStatus = (current: number, max: number) => {
  if (current >= max) return 'exceeded';
  if (current >= max * WIP_WARNING_THRESHOLD) return 'warning';
  return 'ok';
};

export const KanbanColumn = React.memo<KanbanColumnProps>(({
  column,
  tasks,
  onAddTask,
  onTaskClick,
  theme = 'light',
  isDragOver = false,
  dragOverIndex = null,
  onDragOver,
  onTaskDragOver,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  draggedTaskId,
  keyboardDrag,
  searchQuery,
}) => {
  const isDark = theme === 'dark';
  const shouldVirtualize = tasks.length > VIRTUALIZATION_THRESHOLD;

  const virtualized = useVirtualizedList({
    items: tasks,
    itemHeight: ESTIMATED_CARD_HEIGHT,
    containerHeight: 600,
    overscan: 2,
  });

  const wipStatus = useMemo(
    () => (column.maxTasks ? getWipStatus(tasks.length, column.maxTasks) : null),
    [tasks.length, column.maxTasks]
  );

  const renderTask = (task: KanbanTask, index: number) => {
    const isKeyboardDragging = keyboardDrag?.isDragging && keyboardDrag.draggedTaskId === task.id;
    const showDropIndicator =
      dragOverIndex === index && draggedTaskId && draggedTaskId !== task.id;
    const showBottomIndicator =
      dragOverIndex === tasks.length - 1 &&
      index === tasks.length - 1 &&
      draggedTaskId &&
      draggedTaskId !== task.id;

    return (
      <React.Fragment key={task.id}>
        {showDropIndicator && (
          <div className={clsx('h-1 rounded-full mb-2', isDark ? 'bg-primary-600' : 'bg-primary-500')} />
        )}
        <KanbanCard
          task={task}
          onEdit={() => onTaskClick(task)}
          isDragging={draggedTaskId === task.id}
          isKeyboardDragging={isKeyboardDragging}
          onDragStart={onTaskDragStart ? e => onTaskDragStart(e, task.id) : undefined}
          onDragEnd={onTaskDragEnd}
          onDragOver={onTaskDragOver ? e => onTaskDragOver(e, index) : undefined}
          onKeyboardDragStart={keyboardDrag ? () => keyboardDrag.startDrag(task.id) : undefined}
          theme={theme}
          searchQuery={searchQuery}
        />
        {showBottomIndicator && (
          <div className={clsx('h-1 rounded-full mt-2', isDark ? 'bg-primary-600' : 'bg-primary-500')} />
        )}
      </React.Fragment>
    );
  };

  const renderTasks = () => {
    if (tasks.length === 0) {
      return (
        <div className={clsx('text-center text-sm py-8', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
          No tasks
        </div>
      );
    }

    if (shouldVirtualize) {
      return (
        <div
          ref={virtualized.containerRef}
          onScroll={virtualized.handleScroll}
          className="flex-1 min-h-[320px] overflow-y-auto px-1"
          style={{ height: '600px' }}
        >
          <div style={{ height: virtualized.totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${virtualized.offsetY}px)` }}>
              {virtualized.visibleItems.map(({ item: task, index }) => renderTask(task, index))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-[320px] space-y-2 overflow-y-auto px-1">
        {tasks.map((task, index) => renderTask(task, index))}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'flex flex-col min-w-[20rem] flex-shrink-0 rounded-lg p-4 shadow-sm transition-all',
        isDark
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
        <div className="flex items-center gap-2">
          <span
            className={clsx('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}
            aria-label={`${tasks.length} tasks`}
          >
            {tasks.length}
            {column.maxTasks && ` / ${column.maxTasks}`}
          </span>
          {column.maxTasks && wipStatus && (
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                wipStatus === 'exceeded'
                  ? 'bg-error-500'
                  : wipStatus === 'warning'
                    ? 'bg-warning-500'
                    : 'bg-success-500'
              )}
              aria-label={
                wipStatus === 'exceeded'
                  ? 'WIP limit reached'
                  : wipStatus === 'warning'
                    ? 'Approaching WIP limit'
                    : 'Within WIP limit'
              }
            />
          )}
        </div>
      </div>

      {wipStatus === 'exceeded' && (
        <div
          className={clsx(
            'text-xs px-2 py-1 rounded mb-2',
            isDark ? 'bg-error-900 text-error-200' : 'bg-error-50 text-error-700'
          )}
        >
          WIP limit reached
        </div>
      )}

      {wipStatus === 'warning' && (
        <div
          className={clsx(
            'text-xs px-2 py-1 rounded mb-2',
            isDark ? 'bg-warning-900 text-warning-200' : 'bg-warning-50 text-warning-700'
          )}
        >
          Approaching WIP limit
        </div>
      )}

      {renderTasks()}

      <button
        onClick={onAddTask}
        className={clsx(
          'mt-4 text-sm py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded transition-colors',
          isDark ? 'text-neutral-300 hover:text-neutral-100' : 'text-neutral-600 hover:text-neutral-900'
        )}
        aria-label={`Add task to ${column.title} column`}
      >
        + Add task
      </button>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';