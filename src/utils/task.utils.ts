export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getPriorityColor = (priority?: string): string => {
  if (!priority) return '';
  
  const colors = {
    low: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  };
  
  return colors[priority as keyof typeof colors] || '';
};