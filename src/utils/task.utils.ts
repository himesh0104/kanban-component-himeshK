export const isOverdue = (dueDate: Date): boolean => new Date() > dueDate;

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const PRIORITY_COLORS = {
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
} as const;

export const getPriorityColor = (priority?: string): string => {
  if (!priority) return '';
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '';
};