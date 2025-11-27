import React, { useState, useCallback } from 'react';
import { KanbanViewProps, KanbanTask } from './KanbanBoard.types';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

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
  const dragState = useDragAndDrop();

  const handleAddTask = useCallback((columnId: string) => {
  const newTask: KanbanTask = {
    id: `task-${Date.now()}`,
    title: 'New Task',
    description: '',
    status: columnId,
    priority: 'low',
    assignee: '',
    tags: [],
    createdAt: new Date(),
  };

  onTaskCreate(columnId, newTask);
}, [onTaskCreate]);


  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    dragState.handleDragStart(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, [dragState]);

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
          // removed unused sourceIndex
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

  return (
    <div className="p-6">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = column.taskIds
            .map(id => tasks[id])
            .filter(Boolean);

          return (
            <KanbanColumn
              key={column.id}
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
            />
          );
        })}
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={onTaskUpdate}
        onDelete={onTaskDelete}
        columns={columns}
      />
    </div>
  );
};