export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  checklist?: Omit<ChecklistItem, 'id' | 'createdAt'>[];
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  checklist?: ChecklistItem[];
}

export interface TodoFilters {
  filter: 'all' | 'completed' | 'pending';
  priority: 'all' | 'low' | 'medium' | 'high';
}
