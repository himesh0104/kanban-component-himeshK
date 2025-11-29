import React, { useCallback, useEffect, useState } from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { Modal } from '../primitives/Modal';
import clsx from 'clsx';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (columnId: string, task: KanbanTask) => void;
  columnId: string;
  theme?: 'light' | 'dark';
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  columnId,
  theme = 'light',
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const resetForm = useCallback(() => {
    setTitle('');
    setPriority('medium');
    setAssignee('');
    setDescription('');
    setDueDate('');
    setError(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!title.trim()) {
        setError('A title is required to create a task.');
        return;
      }

      const timestamp = new Date();
      const newTask: KanbanTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        status: columnId,
        priority,
        assignee: assignee.trim() || undefined,
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        history: [
          { message: 'Task created', timestamp },
          { message: `Priority set to ${priority}`, timestamp },
        ],
      };

      onCreate(columnId, newTask);
      resetForm();
      onClose();
    },
    [title, description, priority, assignee, dueDate, columnId, onCreate, resetForm, onClose]
  );

  const inputClasses = clsx(
    'w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500',
    isDark ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900'
  );

  const labelClasses = clsx('block text-sm font-medium mb-1', isDark ? 'text-neutral-200' : 'text-neutral-700');

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" theme={theme}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelClasses}>Title</label>
          <input
            type="text"
            placeholder="e.g. Refactor authentication flow"
            className={inputClasses}
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (e.target.value.trim()) {
                setError(null);
              }
            }}
            required
            aria-invalid={!!error}
          />
          {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        </div>

        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            placeholder="Add more context, acceptance criteria, links..."
            className={clsx(inputClasses, 'min-h-[96px]', isDark ? 'placeholder:text-neutral-400' : 'placeholder:text-neutral-500')}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Assignee</label>
            <input
              type="text"
              placeholder="Who owns this task?"
              className={inputClasses}
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClasses}>Due date</label>
            <input type="date" className={inputClasses} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Priority</label>
          <select
            className={inputClasses}
            value={priority}
            onChange={e => setPriority(e.target.value as typeof priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            className={clsx(
              'px-4 py-2 rounded border text-sm',
              isDark ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-700' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            )}
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={clsx(
              'px-4 py-2 rounded text-sm font-medium transition-colors',
              isDark
                ? 'bg-primary-500 text-white hover:bg-primary-400 disabled:bg-neutral-700 disabled:text-neutral-400'
                : 'bg-primary-600 text-white hover:bg-primary-500 disabled:bg-neutral-200 disabled:text-neutral-500'
            )}
            disabled={!title.trim()}
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
