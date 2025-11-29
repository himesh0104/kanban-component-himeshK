import React, { useState } from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { Modal } from '../primitives/Modal';
import { format } from 'date-fns';

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
    const updates: Partial<KanbanTask> = {
      title,
      description,
      priority,
      status,
    };

    const entries: { message: string; timestamp: Date }[] = [];
    if (title !== task.title) entries.push({ message: `Title changed from "${task.title}" to "${title}"`, timestamp: new Date() });
    if ((description || '') !== (task.description || '')) entries.push({ message: `Description updated`, timestamp: new Date() });
    if (priority !== task.priority) entries.push({ message: `Priority changed from ${task.priority || 'none'} to ${priority}`, timestamp: new Date() });
    if (status !== task.status) {
      const from = columns.find(c => c.id === task.status)?.title || task.status;
      const to = columns.find(c => c.id === status)?.title || status;
      entries.push({ message: `Status moved from ${from} to ${to}`, timestamp: new Date() });
    }

    if (entries.length) {
      updates.history = [ ...(task.history || []), ...entries ];
    }

    onUpdate(task.id, updates);
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
        <div className="mt-4 border-t pt-3">
          <h4 className={"text-sm font-medium mb-2 " + (theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700')}>History</h4>
          {(!task.history || task.history.length === 0) ? (
            <div className={theme === 'dark' ? 'text-neutral-400 text-sm' : 'text-neutral-500 text-sm'}>No history</div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto text-sm">
              {task.history.slice().reverse().map((h, i) => (
                <li key={i} className={theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'}>
                  <div className="text-xs text-neutral-500">{format(new Date(h.timestamp), 'MMM d, yyyy HH:mm')}</div>
                  <div>{h.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

