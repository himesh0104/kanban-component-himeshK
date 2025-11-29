import React, { useState } from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { Modal } from '../primitives/Modal';

interface TaskModalProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<KanbanTask>) => void;
  onDelete: (taskId: string) => void;
  columns: { id: string; title: string }[];
  theme?: "light" | "dark";
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  columns,
  theme = 'light',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<KanbanTask['priority']>('medium');
  const [status, setStatus] = useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      description,
      priority,
      status,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" theme={theme}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={"w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          />
        </div>

        <div>
          <label className={"block text-sm font-medium mb-1 " + (theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700')}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={"w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          />
        </div>

        <div>
          <label className={"block text-sm font-medium mb-1 " + (theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700')}>
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as KanbanTask['priority'])}
            className={"w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className={"block text-sm font-medium mb-1 " + (theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700')}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={"w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          >
            {columns.map(col => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            className={"px-4 py-2 rounded-lg " + (theme === 'dark' ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-primary-500 text-white hover:bg-primary-600')}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className={"px-4 py-2 rounded-lg " + (theme === 'dark' ? 'bg-error-500 text-white hover:bg-error-600' : 'bg-error-500 text-white hover:bg-error-600')}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className={"px-4 py-2 rounded-lg " + (theme === 'dark' ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300')}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

