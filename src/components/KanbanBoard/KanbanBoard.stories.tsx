import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './KanbanBoard';
import { KanbanColumn, KanbanTask } from './KanbanBoard.types';
import { useState } from 'react';
import { moveTaskBetweenColumns } from '@/utils/column.utils';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Components/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: ['task-1', 'task-2'], maxTasks: 10 },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: ['task-3'], maxTasks: 5 },
  { id: 'review', title: 'Review', color: '#f59e0b', taskIds: [], maxTasks: 3 },
  { id: 'done', title: 'Done', color: '#10b981', taskIds: ['task-4', 'task-5'] },
];

const defaultTasks: Record<string, KanbanTask> = {
  'task-1': {
    id: 'task-1',
    title: 'Implement drag and drop',
    description: 'Add D&D functionality to kanban cards',
    status: 'todo',
    priority: 'high',
    assignee: 'Himesh',
    tags: ['frontend', 'feature'],
    createdAt: new Date(2025, 0, 10),
    dueDate: new Date(2025, 0, 20),
  },
  'task-2': {
    id: 'task-2',
    title: 'Design task modal',
    description: 'Create modal for editing task details',
    status: 'todo',
    priority: 'medium',
    assignee: 'Shreya',
    tags: ['design', 'ui'],
    createdAt: new Date(2025, 0, 11),
    dueDate: new Date(2025, 0, 18),
  },
  'task-3': {
    id: 'task-3',
    title: 'Setup TypeScript',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Sneha',
    tags: ['setup', 'typescript'],
    createdAt: new Date(2025, 0, 9),
  },
  'task-4': {
    id: 'task-4',
    title: 'Create project structure',
    description: 'Setup folder structure and initial files',
    status: 'done',
    priority: 'low',
    assignee: 'Revati',
    tags: ['setup'],
    createdAt: new Date(2025, 0, 8),
    dueDate: new Date(2025, 0, 9),
  },
  'task-5': {
    id: 'task-5',
    title: 'Install dependencies',
    status: 'done',
    priority: 'low',
    assignee: 'Himesh',
    tags: ['setup'],
    createdAt: new Date(2025, 0, 8),
  },
};

const KanbanBoardWrapper = (args: { columns: KanbanColumn[]; tasks: Record<string, KanbanTask> }) => {
  const [columns, setColumns] = useState(args.columns);
  const [tasks, setTasks] = useState(args.tasks);

  const handleColumnsReorder = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
  };

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
    <KanbanBoard
      columns={columns}
      tasks={tasks}
      onTaskMove={handleTaskMove}
      onTaskCreate={handleTaskCreate}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
      onColumnsReorder={handleColumnsReorder}
    />
  );
};

export const Default: Story = {
  render: () => <KanbanBoardWrapper columns={defaultColumns} tasks={defaultTasks} />,
};

export const Empty: Story = {
  render: () => (
    <KanbanBoardWrapper
      columns={defaultColumns.map(col => ({ ...col, taskIds: [] }))}
      tasks={{}}
    />
  ),
};

const generateLargeTasks = (): Record<string, KanbanTask> => {
  const tasks: Record<string, KanbanTask> = {};
  const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
  const assignees = ['Himesh', 'Shreya', 'Sneha', 'Revati'];
  const tags = ['frontend', 'backend', 'design', 'testing', 'documentation'];
  
  for (let i = 1; i <= 30; i++) {
    const taskId = `task-${i}`;
    tasks[taskId] = {
      id: taskId,
      title: `Task ${i}: ${['Implement feature', 'Fix bug', 'Review code', 'Write tests', 'Update docs'][i % 5]}`,
      description: i % 3 === 0 ? `Description for task ${i}` : undefined,
      status: ['todo', 'in-progress', 'review', 'done'][i % 4],
      priority: priorities[i % 4],
      assignee: assignees[i % 4],
      tags: [tags[i % 5], tags[(i + 1) % 5]].slice(0, 2),
      createdAt: new Date(2024, 0, 10 + (i % 20)),
      dueDate: i % 4 === 0 ? new Date(2024, 0, 20 + (i % 10)) : undefined,
    };
  }
  
  return tasks;
};

const generateLargeColumns = (tasks: Record<string, KanbanTask>): KanbanColumn[] => {
  const todoIds: string[] = [];
  const inProgressIds: string[] = [];
  const reviewIds: string[] = [];
  const doneIds: string[] = [];
  
  Object.values(tasks).forEach(task => {
    if (task.status === 'todo') todoIds.push(task.id);
    else if (task.status === 'in-progress') inProgressIds.push(task.id);
    else if (task.status === 'review') reviewIds.push(task.id);
    else if (task.status === 'done') doneIds.push(task.id);
  });
  
  return [
    { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: todoIds },
    { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: inProgressIds },
    { id: 'review', title: 'Review', color: '#f59e0b', taskIds: reviewIds },
    { id: 'done', title: 'Done', color: '#10b981', taskIds: doneIds },
  ];
};

export const LargeDataset: Story = {
  render: () => {
    const largeTasks = generateLargeTasks();
    const largeColumns = generateLargeColumns(largeTasks);
    return <KanbanBoardWrapper columns={largeColumns} tasks={largeTasks} />;
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => <KanbanBoardWrapper columns={defaultColumns} tasks={defaultTasks} />,
};

const priorityTasks: Record<string, KanbanTask> = {
  'task-low-1': {
    id: 'task-low-1',
    title: 'Low Priority Task 1',
    description: 'This is a low priority task',
    status: 'todo',
    priority: 'low',
    assignee: 'Himesh',
    tags: ['low'],
    createdAt: new Date(2025, 0, 10),
  },
  'task-low-2': {
    id: 'task-low-2',
    title: 'Low Priority Task 2',
    status: 'todo',
    priority: 'low',
    createdAt: new Date(2025, 0, 11),
  },
  'task-medium-1': {
    id: 'task-medium-1',
    title: 'Medium Priority Task 1',
    description: 'This is a medium priority task',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Shreya',
    tags: ['medium'],
    createdAt: new Date(2025, 0, 10),
  },
  'task-medium-2': {
    id: 'task-medium-2',
    title: 'Medium Priority Task 2',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date(2025, 0, 11),
  },
  'task-high-1': {
    id: 'task-high-1',
    title: 'High Priority Task 1',
    description: 'This is a high priority task',
    status: 'review',
    priority: 'high',
    assignee: 'Sneha',
    tags: ['high'],
    createdAt: new Date(2025, 0, 10),
    dueDate: new Date(2025, 0, 15),
  },
  'task-high-2': {
    id: 'task-high-2',
    title: 'High Priority Task 2',
    status: 'review',
    priority: 'high',
    createdAt: new Date(2025, 0, 11),
  },
  'task-urgent-1': {
    id: 'task-urgent-1',
    title: 'Urgent Priority Task 1',
    description: 'This is an urgent priority task',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Revati',
    tags: ['urgent'],
    createdAt: new Date(2025, 0, 10),
    dueDate: new Date(2025, 0, 12),
  },
  'task-urgent-2': {
    id: 'task-urgent-2',
    title: 'Urgent Priority Task 2',
    status: 'in-progress',
    priority: 'urgent',
    createdAt: new Date(2025, 0, 11),
    dueDate: new Date(2025, 0, 13),
  },
};

const priorityColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: ['task-low-1', 'task-low-2', 'task-urgent-1'], maxTasks: 10 },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: ['task-medium-1', 'task-medium-2', 'task-urgent-2'], maxTasks: 5 },
  { id: 'review', title: 'Review', color: '#f59e0b', taskIds: ['task-high-1', 'task-high-2'], maxTasks: 3 },
  { id: 'done', title: 'Done', color: '#10b981', taskIds: [] },
];

export const DifferentPriorities: Story = {
  render: () => <KanbanBoardWrapper columns={priorityColumns} tasks={priorityTasks} />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all priority levels (low, medium, high, urgent) with color-coded borders.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => <KanbanBoardWrapper columns={defaultColumns} tasks={defaultTasks} />,
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo. Try dragging tasks between columns, clicking tasks to edit, and creating new tasks.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => <KanbanBoardWrapper columns={defaultColumns} tasks={defaultTasks} />,
  parameters: {
    docs: {
      description: {
        story: 'Accessibility demonstration. Use keyboard navigation: Tab to move focus, Space/Enter to activate, Arrow keys to navigate between cards. All interactive elements have ARIA labels.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-accessibility',
            enabled: true,
          },
        ],
      },
    },
  },
};