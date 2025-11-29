# Kanban Board Component

A production-ready Kanban Board component built with React, TypeScript, and Tailwind CSS. This component provides a fully functional drag-and-drop task management interface with comprehensive accessibility support.

## Live Storybook

https://kanban-component-himesh-k.vercel.app/

## Installation

```bash
npm install
npm run storybook
```

## Architecture

The component is built with a modular architecture:

- **Components**: Main KanbanBoard component with sub-components (KanbanColumn, KanbanCard, TaskModal)
- **Hooks**: Custom hooks for drag-and-drop state management
- **Utils**: Utility functions for task and column operations
- **Types**: TypeScript interfaces for type safety

## Features

### Core Functionality
- [x] Drag-and-drop tasks between columns with visual feedback
- [x] Drop tasks between specific positions within columns
- [x] Keyboard drag support (Shift+Space to pick up, arrows to move, Enter to drop)
- [x] Task creation and editing via modal
- [x] Task deletion with confirmation
- [x] Column reordering via drag-and-drop

### Task Management
- [x] Priority indicators with color coding (low, medium, high, urgent)
- [x] Assignee management with searchable dropdown
- [x] Tag management (add/remove tags)
- [x] Due date picker with overdue highlighting
- [x] Task history/activity log

### Performance & UX
- [x] Virtual scrolling for large task lists (20+ tasks)
- [x] Debounced search (200ms)
- [x] WIP (Work In Progress) limit indicators
- [x] Search and filter tasks by text and priority
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark mode support with persistence

### Accessibility
- [x] Full keyboard navigation support
- [x] ARIA labels and roles throughout
- [x] WCAG 2.1 AA compliant
- [x] Focus management and indicators
- [x] Screen reader support

### Technical
- [x] React.memo for performance optimization
- [x] Custom hooks for reusable logic
- [x] TypeScript strict mode
- [x] Optimized re-renders

## Storybook Stories

The component includes comprehensive Storybook stories:

- **Default** - Standard board with sample tasks
- **Empty** - Empty board state
- **Large Dataset** - Board with 30+ tasks to test performance
- **Mobile View** - Responsive layout demonstration
- **Different Priorities** - Showcases all priority levels with color coding
- **Interactive Demo** - Fully functional playground
- **Accessibility** - Keyboard navigation and ARIA demonstration

## Technologies

- **React 18** - Component framework
- **TypeScript 5** - Type safety with strict mode
- **Tailwind CSS 3** - Utility-first styling
- **Storybook 7** - Component documentation
- **Vite** - Build tooling
- **date-fns** - Date formatting utilities
- **clsx** - Conditional class management

### Custom Hooks
- `useKeyboardDrag` - Keyboard-based drag and drop
- `useVirtualizedList` - Virtual scrolling for performance
- `useDebounce` - Debounced values for search
- `useDragAndDrop` - Mouse drag state management

## Usage

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

## Accessibility

The component follows WCAG 2.1 AA standards:

- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ARIA labels and roles
- Focus indicators
- Screen reader support

## Design

Built with Tailwind CSS using a custom design system:

- Primary colors for actions
- Neutral colors for backgrounds and text
- Consistent spacing scale
- Subtle shadows and transitions

## License

MIT