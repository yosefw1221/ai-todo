export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;
export const TODO_FILTERS = ['all', 'completed', 'pending'] as const;

export const PRIORITY_COLORS = {
  high: 'text-red-700 bg-red-100 border border-red-200',
  medium: 'text-yellow-800 bg-yellow-100 border border-yellow-300',
  low: 'text-green-700 bg-green-100 border border-green-200',
} as const;

export const API_ENDPOINTS = {
  TODOS: '/api/todos',
  CHAT: '/api/chat',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
} as const;
