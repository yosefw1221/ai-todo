export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;
export const TODO_FILTERS = ['all', 'completed', 'pending'] as const;

export const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50',
} as const;

export const API_ENDPOINTS = {
  TODOS: '/api/todos',
  CHAT: '/api/chat',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
} as const;
