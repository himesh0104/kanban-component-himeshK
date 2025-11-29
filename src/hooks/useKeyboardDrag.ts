import { useState, useCallback, useRef } from 'react';

interface KeyboardDragState {
  isDragging: boolean;
  draggedTaskId: string | null;
  targetColumnId: string | null;
  targetIndex: number | null;
}

interface UseKeyboardDragOptions {
  columns: Array<{ id: string; taskIds: string[] }>;
  onMove: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
}

export const useKeyboardDrag = ({ columns, onMove }: UseKeyboardDragOptions) => {
  const [state, setState] = useState<KeyboardDragState>({
    isDragging: false,
    draggedTaskId: null,
    targetColumnId: null,
    targetIndex: null,
  });

  const draggedTaskRef = useRef<string | null>(null);
  const targetColumnRef = useRef<string | null>(null);
  const targetIndexRef = useRef<number | null>(null);

  const findTaskPosition = useCallback((taskId: string) => {
    for (const column of columns) {
      const index = column.taskIds.indexOf(taskId);
      if (index !== -1) {
        return { columnId: column.id, index };
      }
    }
    return null;
  }, [columns]);

  const startDrag = useCallback((taskId: string) => {
    const position = findTaskPosition(taskId);
    if (!position) return;

    setState({
      isDragging: true,
      draggedTaskId: taskId,
      targetColumnId: position.columnId,
      targetIndex: position.index,
    });
    draggedTaskRef.current = taskId;
    targetColumnRef.current = position.columnId;
    targetIndexRef.current = position.index;
  }, [findTaskPosition]);

  const moveTarget = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!state.isDragging || !targetColumnRef.current) return;

    const currentColumn = columns.find(c => c.id === targetColumnRef.current);
    if (!currentColumn) return;

    let newColumnId = targetColumnRef.current;
    let newIndex = targetIndexRef.current ?? 0;

    if (direction === 'up') {
      newIndex = Math.max(0, (targetIndexRef.current ?? 0) - 1);
    } else if (direction === 'down') {
      newIndex = Math.min(currentColumn.taskIds.length, (targetIndexRef.current ?? 0) + 1);
    } else if (direction === 'left') {
      const currentColIndex = columns.findIndex(c => c.id === targetColumnRef.current);
      if (currentColIndex > 0) {
        const prevColumn = columns[currentColIndex - 1];
        newColumnId = prevColumn.id;
        newIndex = prevColumn.taskIds.length;
      }
    } else if (direction === 'right') {
      const currentColIndex = columns.findIndex(c => c.id === targetColumnRef.current);
      if (currentColIndex < columns.length - 1) {
        const nextColumn = columns[currentColIndex + 1];
        newColumnId = nextColumn.id;
        newIndex = nextColumn.taskIds.length;
      }
    }

    targetColumnRef.current = newColumnId;
    targetIndexRef.current = newIndex;

    setState(prev => ({
      ...prev,
      targetColumnId: newColumnId,
      targetIndex: newIndex,
    }));
  }, [state.isDragging, columns]);

  const commitDrag = useCallback(() => {
    if (!state.isDragging || !draggedTaskRef.current || !targetColumnRef.current) return;

    const position = findTaskPosition(draggedTaskRef.current);
    if (!position) return;

    const sourceColumnId = position.columnId;
    const targetColumnId = targetColumnRef.current;
    const targetIndex = targetIndexRef.current ?? 0;

    if (sourceColumnId !== targetColumnId || position.index !== targetIndex) {
      const adjustedIndex = sourceColumnId === targetColumnId && position.index < targetIndex
        ? targetIndex - 1
        : targetIndex;

      onMove(
        draggedTaskRef.current,
        sourceColumnId,
        targetColumnId,
        Math.max(0, adjustedIndex)
      );
    }

    setState({
      isDragging: false,
      draggedTaskId: null,
      targetColumnId: null,
      targetIndex: null,
    });
    draggedTaskRef.current = null;
    targetColumnRef.current = null;
    targetIndexRef.current = null;
  }, [state.isDragging, findTaskPosition, onMove]);

  const cancelDrag = useCallback(() => {
    setState({
      isDragging: false,
      draggedTaskId: null,
      targetColumnId: null,
      targetIndex: null,
    });
    draggedTaskRef.current = null;
    targetColumnRef.current = null;
    targetIndexRef.current = null;
  }, []);

  return {
    ...state,
    startDrag,
    moveTarget,
    commitDrag,
    cancelDrag,
  };
};
