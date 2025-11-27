import React, { useState } from "react";
import { KanbanTask } from "./KanbanBoard.types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (columnId: string, task: KanbanTask) => void;
  columnId: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  columnId,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="bg-white p-6 rounded-xl shadow-lg relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Task title"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="Assignee"
            className="w-full border p-2 rounded"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
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
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 bg-neutral-200 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};