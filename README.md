# Kanban Board Component

A production-ready Kanban Board component built with React, TypeScript, and Tailwind CSS. This component provides a fully functional drag-and-drop task management interface with comprehensive accessibility support.

## 🚀 Live Storybook

https://kanban-component-himesh-k.vercel.app/

## 📦 Installation

```bash
npm install
npm run storybook
```

## 🏗️ Architecture

The component is built with a modular architecture:

- **Components**: Main KanbanBoard component with sub-components (KanbanColumn, KanbanCard, TaskModal)
- **Hooks**: Custom hooks for drag-and-drop state management
- **Utils**: Utility functions for task and column operations
- **Types**: TypeScript interfaces for type safety

## ✨ Features

- [x] Drag-and-drop tasks between columns
- [x] Task creation and editing via modal
- [x] Task deletion
- [x] Priority indicators with color coding
- [x] Assignee avatars with initials
- [x] Tag badges
- [x] Due date display with overdue highlighting
- [x] Responsive design (mobile, tablet, desktop)
- [x] Keyboard navigation support
- [x] ARIA labels and accessibility features
- [x] Performance optimizations with React.memo

## 📚 Storybook Stories

The component includes comprehensive Storybook stories:

- **Default** - Standard board with sample tasks
- **Empty** - Empty board state
- **Large Dataset** - Board with 30+ tasks to test performance
- **Mobile View** - Responsive layout demonstration

## 🛠️ Technologies

- React 18
- TypeScript 5
- Tailwind CSS 3
- Storybook 7
- Vite
- date-fns (date formatting)
- clsx (conditional classes)

## 📝 Usage

```tsx
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';

const columns = [
  { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: ['task-1'] },
  { id: 'done', title: 'Done', color: '#10b981', taskIds: [] },
];

const tasks = {
  'task-1': {
    id: 'task-1',
    title: 'My Task',
    status: 'todo',
    priority: 'high',
    createdAt: new Date(),
  },
};

<KanbanBoard
  columns={columns}
  tasks={tasks}
  onTaskMove={handleTaskMove}
  onTaskCreate={handleTaskCreate}
  onTaskUpdate={handleTaskUpdate}
  onTaskDelete={handleTaskDelete}
/>
```

## ♿ Accessibility

The component follows WCAG 2.1 AA standards:

- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ARIA labels and roles
- Focus indicators
- Screen reader support

## 🎨 Design

Built with Tailwind CSS using a custom design system:

- Primary colors for actions
- Neutral colors for backgrounds and text
- Consistent spacing scale
- Subtle shadows and transitions

## 📄 License

MIT

