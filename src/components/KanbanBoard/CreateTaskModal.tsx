import React, { useState } from "react";
import { KanbanTask } from "./KanbanBoard.types";
import { Modal } from '../primitives/Modal';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (columnId: string, task: KanbanTask) => void;
  columnId: string;
  theme?: "light" | "dark";
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  columnId,
  theme = 'light',
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: columnId,
      priority,
      assignee,
      tags: [],
      createdAt: new Date(),
    };

    onCreate(columnId, newTask);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" theme={theme}>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Task title"
          className={"w-full border p-2 rounded " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className={"w-full border p-2 rounded " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Assignee"
          className={"w-full border p-2 rounded " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />

        <select
          className={"w-full border p-2 rounded " + (theme === 'dark' ? 'border-neutral-600 bg-neutral-700 text-neutral-100' : 'border-neutral-300 bg-white text-neutral-900')}
          value={priority}
          onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high" | "urgent")
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <div className="flex justify-end gap-3 mt-2">
          <button className={"px-4 py-2 rounded " + (theme === 'dark' ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300')} onClick={onClose}>
            Cancel
          </button>

          <button
            className={"px-4 py-2 rounded " + (theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700')}
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Create Task
          </button>
        </div>
      </div>
    </Modal>
  );
};