import React, { useState, useCallback } from 'react';
import { KanbanViewProps, KanbanTask } from './KanbanBoard.types';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { CreateTaskModal } from './CreateTaskModal';

export const KanbanBoard: React.FC<KanbanViewProps> = ({
  columns,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const dragState = useDragAndDrop();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high" | "urgent">("all");
  const [theme, setTheme] = useState<"light" | "dark">(
    (typeof window !== 'undefined' && localStorage.getItem('kanban-theme') === 'dark') ? 'dark' : 'light'
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('kanban-theme', newTheme);
    } catch (e) {
      // ignore
    }
  }, [theme]);
  const handleAddTask = useCallback((columnId: string) => {
    setCreateColumnId(columnId);
    setCreateModalOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      dragState.handleDragStart(taskId);
      e.dataTransfer.effectAllowed = 'move';
    },
    [dragState]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    dragState.handleDragEnd();
  }, [dragState]);

  const handleColumnDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleColumnDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      if (draggedTaskId) {
        const sourceColumn = columns.find(col => col.taskIds.includes(draggedTaskId));
        if (sourceColumn && sourceColumn.id !== columnId) {
          const destColumn = columns.find(col => col.id === columnId);
          if (destColumn) {
            onTaskMove(
              draggedTaskId,
              sourceColumn.id,
              columnId,
              destColumn.taskIds.length
            );
          }
        }
      }
      setDragOverColumn(null);
      setDraggedTaskId(null);
      dragState.handleDragEnd();
    },
    [draggedTaskId, columns, onTaskMove, dragState]
  );

  const handleColumnDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleColumnDragOver2 = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleColumnDrop2 = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();

      if (!draggedColumnId || draggedColumnId === targetColumnId) return;

      const srcIndex = columns.findIndex(col => col.id === draggedColumnId);
      const destIndex = columns.findIndex(col => col.id === targetColumnId);

      if (srcIndex === -1 || destIndex === -1) return;

      const newColumns = [...columns];
      const [removed] = newColumns.splice(srcIndex, 1);
      newColumns.splice(destIndex, 0, removed);

      onTaskMove("__reorder_columns__", "", "", 0);
      
      (columns as any).splice(0, columns.length, ...newColumns);

      setDraggedColumnId(null);
    },
    [draggedColumnId, columns, onTaskMove]
  );

  return (
    <div className={`p-6 transition-colors duration-300 min-h-screen ${theme === 'dark' ? 'bg-neutral-900 text-neutral-200' : 'bg-neutral-50 text-neutral-900'}`}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">Kanban Board</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-md border text-sm"
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀ Light Mode'}
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search tasks…"
            className="border p-2 rounded w-64 shadow-sm focus:ring-2 focus:ring-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="border p-2 rounded shadow-sm focus:ring-2 focus:ring-primary-500"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as "all" | "low" | "medium" | "high" | "urgent")
            }
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {columns.map(column => {
          const columnTasks = column.taskIds
            .map(id => tasks[id])
            .filter(Boolean)
            .filter(task => {
              const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());

              const matchesPriority =
                priorityFilter === "all" || task.priority === priorityFilter;

              return matchesSearch && matchesPriority;
            });

          return (
            <div
              key={column.id}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, column.id)}
              onDragOver={handleColumnDragOver2}
              onDrop={(e) => handleColumnDrop2(e, column.id)}
              className="transition-opacity flex-shrink-0"
              style={{
                opacity: draggedColumnId === column.id ? 0.5 : 1,
                minWidth: '20rem'
              }}
            >
              <KanbanColumn
                column={column}
                tasks={columnTasks}
                onAddTask={() => handleAddTask(column.id)}
                onTaskClick={handleTaskClick}
                isDragOver={dragOverColumn === column.id}
                onDragOver={e => handleColumnDragOver(e, column.id)}
                onDrop={e => handleColumnDrop(e, column.id)}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                draggedTaskId={draggedTaskId}
                theme={theme}
              />
            </div>
          );
        })}
        </div>
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={onTaskUpdate}
        onDelete={onTaskDelete}
        columns={columns}
        theme={theme}
      />
      
      {createModalOpen && createColumnId && (
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={onTaskCreate}
          columnId={createColumnId}
          theme={theme}
        />
      )}
    </div>
  );
};
