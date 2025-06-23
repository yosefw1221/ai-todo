import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Todo, { ITodo } from '@/models/Todo';

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface TodoFilters {
  filter?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
}

export class TodoController {
  static async getAllTodos(filters: TodoFilters = {}) {
    try {
      await connectDB();

      const { filter, priority } = filters;
      let query: any = {};

      if (filter === 'completed') {
        query.completed = true;
      } else if (filter === 'pending') {
        query.completed = false;
      }

      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      const todos = await Todo.find(query).sort({ createdAt: -1 });
      return { success: true, todos };
    } catch (error) {
      console.error('Error fetching todos:', error);
      return { success: false, error: 'Failed to fetch todos' };
    }
  }

  static async createTodo(todoData: CreateTodoRequest) {
    try {
      await connectDB();

      const { title, description, priority = 'medium' } = todoData;

      if (!title?.trim()) {
        return { success: false, error: 'Title is required' };
      }

      const todo = new Todo({
        title: title.trim(),
        description: description?.trim(),
        priority,
        completed: false,
      });

      await todo.save();
      return { success: true, todo: todo.toObject() };
    } catch (error) {
      console.error('Error creating todo:', error);
      return { success: false, error: 'Failed to create todo' };
    }
  }

  static async updateTodo(id: string, updateData: UpdateTodoRequest) {
    try {
      await connectDB();

      if (!id) {
        return { success: false, error: 'Todo ID is required' };
      }

      const cleanUpdateData: any = {};
      if (updateData.title !== undefined)
        cleanUpdateData.title = updateData.title.trim();
      if (updateData.description !== undefined)
        cleanUpdateData.description = updateData.description?.trim();
      if (updateData.completed !== undefined)
        cleanUpdateData.completed = updateData.completed;
      if (updateData.priority !== undefined)
        cleanUpdateData.priority = updateData.priority;

      const todo = await Todo.findByIdAndUpdate(id, cleanUpdateData, {
        new: true,
        runValidators: true,
      });

      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }

      return { success: true, todo: todo.toObject() };
    } catch (error) {
      console.error('Error updating todo:', error);
      return { success: false, error: 'Failed to update todo' };
    }
  }

  static async deleteTodo(id: string) {
    try {
      await connectDB();

      if (!id) {
        return { success: false, error: 'Todo ID is required' };
      }

      const todo = await Todo.findByIdAndDelete(id);

      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }

      return { success: true, message: 'Todo deleted successfully' };
    } catch (error) {
      console.error('Error deleting todo:', error);
      return { success: false, error: 'Failed to delete todo' };
    }
  }

  static async getTodoById(id: string) {
    try {
      await connectDB();

      if (!id) {
        return { success: false, error: 'Todo ID is required' };
      }

      const todo = await Todo.findById(id);

      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }

      return { success: true, todo: todo.toObject() };
    } catch (error) {
      console.error('Error fetching todo:', error);
      return { success: false, error: 'Failed to fetch todo' };
    }
  }
}
