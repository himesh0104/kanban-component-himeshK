import React, { useState, useCallback, useMemo } from 'react';
import { KanbanViewProps, KanbanTask } from './KanbanBoard.types';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { useKeyboardDrag } from '@/hooks/useKeyboardDrag';
import { useDebounce } from '@/hooks/useDebounce';
import clsx from 'clsx';

type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';
type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'kanban-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'light';
};

const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable
  }
};

export const KanbanBoard: React.FC<KanbanViewProps> = ({
  columns,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onColumnsReorder,
}) => {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [createModalState, setCreateModalState] = useState<{ open: boolean; columnId: string | null }>({
    open: false,
    columnId: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const debouncedSearch = useDebounce(searchQuery, 200);

  const keyboardDrag = useKeyboardDrag({
    columns,
    onMove: onTaskMove,
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveTheme(next);
      return next;
    });
  }, []);

  const openCreateModal = useCallback((columnId: string) => {
    setCreateModalState({ open: true, columnId });
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalState({ open: false, columnId: null });
  }, []);

  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  }, []);

  const handleColumnDragOver = useCallback((e: React.DragEvent, columnId: string, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  }, []);

  const handleColumnDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      if (!draggedTaskId) return;

      const sourceColumn = columns.find(col => col.taskIds.includes(draggedTaskId));
      if (!sourceColumn) return;

      const destColumn = columns.find(col => col.id === columnId);
      if (!destColumn) return;

      const sourceIndex = sourceColumn.taskIds.indexOf(draggedTaskId);
      const targetIndex = dragOverIndex ?? destColumn.taskIds.length;

      const finalIndex =
        sourceColumn.id === columnId && sourceIndex < targetIndex
          ? targetIndex - 1
          : targetIndex;

      onTaskMove(
        draggedTaskId,
        sourceColumn.id,
        columnId,
        Math.max(0, Math.min(finalIndex, destColumn.taskIds.length))
      );

      setDragOverColumn(null);
      setDragOverIndex(null);
      setDraggedTaskId(null);
    },
    [draggedTaskId, columns, dragOverIndex, onTaskMove]
  );

  const handleColumnDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    if ((e.target as HTMLElement).closest('[data-task-card]')) {
      e.preventDefault();
      return;
    }
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleColumnDrop2 = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();
      if (!draggedColumnId || draggedColumnId === targetColumnId) return;

      const srcIndex = columns.findIndex(col => col.id === draggedColumnId);
      const destIndex = columns.findIndex(col => col.id === targetColumnId);
      if (srcIndex === -1 || destIndex === -1) return;

      if (onColumnsReorder) {
        const newColumns = [...columns];
        const [removed] = newColumns.splice(srcIndex, 1);
        newColumns.splice(destIndex, 0, removed);
        onColumnsReorder(newColumns);
      }

      setDraggedColumnId(null);
    },
    [draggedColumnId, columns, onColumnsReorder]
  );

  const filteredColumns = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    const filter = priorityFilter;

    return columns.map(column => {
      const columnTasks = column.taskIds
        .map(id => tasks[id])
        .filter((task): task is KanbanTask => {
          if (!task) return false;
          const matchesSearch =
            !query ||
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query);
          const matchesPriority = filter === 'all' || task.priority === filter;
          return Boolean(matchesSearch && matchesPriority);
        });

      return { column, tasks: columnTasks };
    });
  }, [columns, tasks, debouncedSearch, priorityFilter]);

  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'p-6 transition-colors duration-300 min-h-screen',
        isDark ? 'bg-neutral-900 text-neutral-200' : 'bg-neutral-50 text-neutral-900'
      )}
    >
      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">Kanban Board</h1>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-md border text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀ Light'}
          </button>
        </header>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={clsx(
              'border p-2 rounded w-64 shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none',
              isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300'
            )}
            aria-label="Search tasks"
          />
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
            className={clsx(
              'border p-2 rounded shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none',
              isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300'
            )}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {filteredColumns.map(({ column, tasks: columnTasks }) => (
            <div
              key={column.id}
              className="transition-opacity flex-shrink-0"
              style={{
                opacity: draggedColumnId === column.id ? 0.5 : 1,
                minWidth: '20rem',
              }}
            >
              <KanbanColumn
                column={column}
                tasks={columnTasks}
                onAddTask={() => openCreateModal(column.id)}
                onTaskClick={handleTaskClick}
                isDragOver={dragOverColumn === column.id}
                dragOverIndex={dragOverColumn === column.id ? dragOverIndex : null}
                onDragOver={e => {
                  if (!(e.target as HTMLElement).closest('[data-task-card]')) {
                    handleColumnDragOver(e, column.id);
                  }
                }}
                onTaskDragOver={(e, index) => {
                  e.stopPropagation();
                  handleColumnDragOver(e, column.id, index);
                }}
                onDrop={e => {
                  if (!(e.target as HTMLElement).closest('[data-task-card]')) {
                    handleColumnDrop(e, column.id);
                  }
                }}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                draggedTaskId={draggedTaskId}
                keyboardDrag={keyboardDrag.isDragging ? keyboardDrag : undefined}
                theme={theme}
                onColumnDragStart={e => handleColumnDragStart(e, column.id)}
                onColumnDrop={e => handleColumnDrop2(e, column.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
          columns={columns}
          theme={theme}
        />
      )}

      {createModalState.open && createModalState.columnId && (
        <CreateTaskModal
          isOpen={createModalState.open}
          onClose={closeCreateModal}
          onCreate={onTaskCreate}
          columnId={createModalState.columnId}
          theme={theme}
        />
      )}
    </div>
  );
};