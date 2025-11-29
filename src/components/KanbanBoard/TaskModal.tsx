import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { KanbanTask } from './KanbanBoard.types';
import { Modal } from '../primitives/Modal';
import { format } from 'date-fns';
import { Avatar } from '../primitives/Avatar';
import clsx from 'clsx';

interface TaskModalProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<KanbanTask>) => void;
  onDelete: (taskId: string) => void;
  columns: { id: string; title: string }[];
  theme?: 'light' | 'dark';
}

const COMMON_ASSIGNEES = ['Himesh', 'Shreya', 'Sneha', 'Revati'];

const buildHistoryEntry = (
  task: KanbanTask,
  updates: Partial<KanbanTask>,
  columns: { id: string; title: string }[]
): Array<{ message: string; timestamp: Date }> => {
  const entries: Array<{ message: string; timestamp: Date }> = [];
  const now = new Date();

  if (updates.title && updates.title !== task.title) {
    entries.push({ message: `Title changed from "${task.title}" to "${updates.title}"`, timestamp: now });
  }
  if (updates.description !== undefined && updates.description !== task.description) {
    entries.push({ message: 'Description updated', timestamp: now });
  }
  if (updates.priority && updates.priority !== task.priority) {
    entries.push({
      message: `Priority changed from ${task.priority || 'none'} to ${updates.priority}`,
      timestamp: now,
    });
  }
  if (updates.status && updates.status !== task.status) {
    const from = columns.find(c => c.id === task.status)?.title || task.status;
    const to = columns.find(c => c.id === updates.status)?.title || updates.status;
    entries.push({ message: `Status moved from ${from} to ${to}`, timestamp: now });
  }
  if (updates.assignee !== undefined && updates.assignee !== task.assignee) {
    entries.push({
      message: updates.assignee ? `Assignee changed to ${updates.assignee}` : 'Assignee removed',
      timestamp: now,
    });
  }
  if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(task.tags || [])) {
    entries.push({ message: 'Tags updated', timestamp: now });
  }

  return entries;
};

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
  const [assignee, setAssignee] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status);
      setAssignee(task.assignee || '');
      setTags(task.tags || []);
      setDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '');
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };

    if (showAssigneeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAssigneeDropdown]);

  const filteredAssignees = useMemo(() => {
    const query = assigneeSearch.trim().toLowerCase();
    if (!query) return COMMON_ASSIGNEES;
    return COMMON_ASSIGNEES.filter(name => name.toLowerCase().includes(query));
  }, [assigneeSearch]);

  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleSave = useCallback(() => {
    if (!task) return;

    const updates: Partial<KanbanTask> = {
      title,
      description: description || undefined,
      priority,
      status,
      assignee: assignee.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    const historyEntries = buildHistoryEntry(task, updates, columns);
    if (historyEntries.length > 0) {
      updates.history = [...(task.history || []), ...historyEntries];
    }

    onUpdate(task.id, updates);
    onClose();
  }, [task, title, description, priority, status, assignee, tags, dueDate, columns, onUpdate, onClose]);

  const handleDelete = useCallback(() => {
    if (!task) return;
    if (window.confirm('Delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  }, [task, onDelete, onClose]);

  const inputClasses = clsx(
    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
    isDark ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900'
  );

  const labelClasses = clsx('block text-sm font-medium mb-1', isDark ? 'text-neutral-200' : 'text-neutral-700');

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" theme={theme}>
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} />
        </div>

        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as KanbanTask['priority'])}
            className={inputClasses}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClasses}>
            {columns.map(col => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative" ref={assigneeDropdownRef}>
          <label className={labelClasses}>Assignee</label>
          <div className="relative">
            <input
              type="text"
              value={assigneeSearch || assignee}
              onChange={e => {
                setAssigneeSearch(e.target.value);
                setAssignee(e.target.value);
                setShowAssigneeDropdown(true);
              }}
              onFocus={() => setShowAssigneeDropdown(true)}
              placeholder="Search or type assignee name"
              className={inputClasses}
            />
            {assignee && !assigneeSearch && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Avatar name={assignee} size="sm" />
              </div>
            )}
            {showAssigneeDropdown && filteredAssignees.length > 0 && (
              <div
                className={clsx(
                  'absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-40 overflow-y-auto',
                  isDark ? 'bg-neutral-700 border-neutral-600' : 'bg-white border-neutral-300'
                )}
              >
                {filteredAssignees.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setAssignee(name);
                      setAssigneeSearch('');
                      setShowAssigneeDropdown(false);
                    }}
                    className={clsx(
                      'w-full px-3 py-2 text-left hover:bg-primary-500 hover:text-white flex items-center gap-2',
                      isDark ? 'text-neutral-200' : 'text-neutral-900'
                    )}
                  >
                    <Avatar name={name} size="sm" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {assignee && (
            <button
              type="button"
              onClick={() => {
                setAssignee('');
                setAssigneeSearch('');
              }}
              className={clsx(
                'mt-1 text-xs',
                isDark ? 'text-error-400 hover:text-error-300' : 'text-error-600 hover:text-error-700'
              )}
            >
              Clear assignee
            </button>
          )}
        </div>

        <div>
          <label className={labelClasses}>Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} />
        </div>

        <div>
          <label className={labelClasses}>Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag"
              className={clsx('flex-1', inputClasses)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className={clsx(
                'px-4 py-2 rounded-lg',
                isDark ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-primary-500 text-white hover:bg-primary-600'
              )}
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-1 rounded text-sm',
                    isDark ? 'bg-neutral-600 text-neutral-200' : 'bg-neutral-100 text-neutral-700'
                  )}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={clsx('hover:text-error-500', isDark ? 'text-neutral-300' : 'text-neutral-500')}
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            className={clsx(
              'px-4 py-2 rounded-lg',
              isDark ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className={clsx(
              'px-4 py-2 rounded-lg',
              isDark ? 'bg-error-500 text-white hover:bg-error-600' : 'bg-error-500 text-white hover:bg-error-600'
            )}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className={clsx(
              'px-4 py-2 rounded-lg',
              isDark ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            )}
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 border-t pt-3">
          <h4 className={labelClasses}>History</h4>
          {!task.history || task.history.length === 0 ? (
            <div className={clsx('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>No history</div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto text-sm">
              {task.history
                .slice()
                .reverse()
                .map((h, i) => (
                  <li key={i} className={clsx(isDark ? 'text-neutral-300' : 'text-neutral-700')}>
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
