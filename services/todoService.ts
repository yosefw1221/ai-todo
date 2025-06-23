import {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  ChecklistItem,
} from '@/types/todo';

const API_BASE = '/api/todos';

export class TodoService {
  // Basic todo operations
  static async getAllTodos(params?: { filter?: string; priority?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.append('filter', params.filter);
    if (params?.priority) searchParams.append('priority', params.priority);

    const url = `${API_BASE}${
      searchParams.toString() ? `?${searchParams}` : ''
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return response.json();
  }

  static async createTodo(todoData: CreateTodoData) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error('Failed to create todo');
    }

    return response.json();
  }

  static async updateTodo(id: string, updateData: UpdateTodoData) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    return response.json();
  }

  static async deleteTodo(id: string) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }

    return response.json();
  }

  static async getTodoById(id: string) {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }

    return response.json();
  }

  // Checklist operations
  static async addChecklistItem(todoId: string, text: string) {
    const response = await fetch(`${API_BASE}/${todoId}/checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to add checklist item');
    }

    return response.json();
  }

  static async updateChecklistItem(
    todoId: string,
    itemId: string,
    updateData: { text?: string; completed?: boolean }
  ) {
    const response = await fetch(`${API_BASE}/${todoId}/checklist/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update checklist item');
    }

    return response.json();
  }

  static async deleteChecklistItem(todoId: string, itemId: string) {
    const response = await fetch(`${API_BASE}/${todoId}/checklist/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete checklist item');
    }

    return response.json();
  }

  // Utility methods
  static async toggleChecklistItem(
    todoId: string,
    itemId: string,
    completed: boolean
  ) {
    return this.updateChecklistItem(todoId, itemId, { completed });
  }

  static async editChecklistItemText(
    todoId: string,
    itemId: string,
    text: string
  ) {
    return this.updateChecklistItem(todoId, itemId, { text });
  }
}
