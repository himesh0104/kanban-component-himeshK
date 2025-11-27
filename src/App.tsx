import React, { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
import { KanbanColumn, KanbanTask } from './components/KanbanBoard/KanbanBoard.types';
import { moveTaskBetweenColumns, reorderTasks } from './utils/column.utils';

const initialColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: ['task-1', 'task-2'] },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: ['task-3'] },
  { id: 'review', title: 'Review', color: '#f59e0b', taskIds: [] },
  { id: 'done', title: 'Done', color: '#10b981', taskIds: ['task-4', 'task-5'] },
];

const initialTasks: Record<string, KanbanTask> = {
  'task-1': {
    id: 'task-1',
    title: 'Implement drag and drop',
    description: 'Add D&D functionality to kanban cards',
    status: 'todo',
    priority: 'high',
    assignee: 'John Doe',
    tags: ['frontend', 'feature'],
    createdAt: new Date(2024, 0, 10),
    dueDate: new Date(2024, 0, 20),
  },
  'task-2': {
    id: 'task-2',
    title: 'Design task modal',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    tags: ['design'],
    createdAt: new Date(2024, 0, 11),
  },
  'task-3': {
    id: 'task-3',
    title: 'Setup TypeScript',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'John Doe',
    createdAt: new Date(2024, 0, 9),
  },
  'task-4': {
    id: 'task-4',
    title: 'Create project structure',
    status: 'done',
    priority: 'low',
    assignee: 'Jane Smith',
    createdAt: new Date(2024, 0, 8),
  },
  'task-5': {
    id: 'task-5',
    title: 'Install dependencies',
    status: 'done',
    priority: 'low',
    createdAt: new Date(2024, 0, 8),
  },
};

function App() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [tasks, setTasks] = useState<Record<string, KanbanTask>>(initialTasks);

  const handleTaskMove = (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => {
    setColumns(prev => {
      const sourceCol = prev.find(c => c.id === fromColumn);
      const destCol = prev.find(c => c.id === toColumn);
      
      if (!sourceCol || !destCol) return prev;

      const sourceIndex = sourceCol.taskIds.indexOf(taskId);
      if (sourceIndex === -1) return prev;

      const result = moveTaskBetweenColumns(
        sourceCol.taskIds,
        destCol.taskIds,
        sourceIndex,
        newIndex
      );

      return prev.map(col => {
        if (col.id === fromColumn) {
          return { ...col, taskIds: result.source };
        }
        if (col.id === toColumn) {
          return { ...col, taskIds: result.destination };
        }
        return col;
      });
    });

    setTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: toColumn },
    }));
  };

  const handleTaskCreate = (columnId: string, task: KanbanTask) => {
    setTasks(prev => ({ ...prev, [task.id]: task }));
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, taskIds: [...col.taskIds, task.id] }
          : col
      )
    );
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<KanbanTask>) => {
    setTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates },
    }));

    if (updates.status) {
      setColumns(prev => {
        const oldCol = prev.find(c => c.taskIds.includes(taskId));
        const newCol = prev.find(c => c.id === updates.status);
        
        if (!oldCol || !newCol || oldCol.id === newCol.id) return prev;

        return prev.map(col => {
          if (col.id === oldCol.id) {
            return { ...col, taskIds: col.taskIds.filter(id => id !== taskId) };
          }
          if (col.id === newCol.id) {
            return { ...col, taskIds: [...col.taskIds, taskId] };
          }
          return col;
        });
      });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setColumns(prev =>
      prev.map(col => ({
        ...col,
        taskIds: col.taskIds.filter(id => id !== taskId),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <KanbanBoard
        columns={columns}
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onTaskCreate={handleTaskCreate}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  );
}

export default App;

