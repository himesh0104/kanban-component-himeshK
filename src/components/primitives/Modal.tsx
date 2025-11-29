import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: "light" | "dark";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, theme = 'light' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className={
          'relative rounded-xl shadow-modal p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ' +
          (theme === 'dark' ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-900')
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className={theme === 'dark' ? 'text-xl font-semibold text-neutral-100' : 'text-xl font-semibold text-neutral-900'}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={theme === 'dark' ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};