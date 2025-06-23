import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Todo, { ITodo, IChecklistItem } from '@/models/Todo';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  checklist?: { text: string; completed?: boolean }[];
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  checklist?: IChecklistItem[];
}

export interface TodoFilters {
  filter?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
}

export interface ChecklistItemUpdate {
  id: string;
  text?: string;
  completed?: boolean;
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

      const {
        title,
        description,
        priority = 'medium',
        checklist = [],
      } = todoData;

      if (!title?.trim()) {
        return { success: false, error: 'Title is required' };
      }

      // Process checklist items
      const processedChecklist: IChecklistItem[] = checklist.map((item) => ({
        id: uuidv4(),
        text: item.text.trim(),
        completed: item.completed || false,
        createdAt: new Date(),
      }));

      const todo = new Todo({
        title: title.trim(),
        description: description?.trim(),
        priority,
        completed: false,
        checklist: processedChecklist,
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
      if (updateData.checklist !== undefined)
        cleanUpdateData.checklist = updateData.checklist;

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

  static async addChecklistItem(todoId: string, itemText: string) {
    try {
      await connectDB();

      if (!todoId || !itemText?.trim()) {
        return { success: false, error: 'Todo ID and item text are required' };
      }

      const newItem: IChecklistItem = {
        id: uuidv4(),
        text: itemText.trim(),
        completed: false,
        createdAt: new Date(),
      };

      const todo = await Todo.findByIdAndUpdate(
        todoId,
        { $push: { checklist: newItem } },
        { new: true, runValidators: true }
      );

      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }

      return { success: true, todo: todo.toObject(), addedItem: newItem };
    } catch (error) {
      console.error('Error adding checklist item:', error);
      return { success: false, error: 'Failed to add checklist item' };
    }
  }

  static async updateChecklistItem(
    todoId: string,
    itemUpdate: ChecklistItemUpdate
  ) {
    try {
      await connectDB();

      if (!todoId || !itemUpdate.id) {
        return { success: false, error: 'Todo ID and item ID are required' };
      }

      const updateFields: any = {};
      if (itemUpdate.text !== undefined) {
        updateFields['checklist.$.text'] = itemUpdate.text.trim();
      }
      if (itemUpdate.completed !== undefined) {
        updateFields['checklist.$.completed'] = itemUpdate.completed;
      }

      const todo = await Todo.findOneAndUpdate(
        { _id: todoId, 'checklist.id': itemUpdate.id },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!todo) {
        return { success: false, error: 'Todo or checklist item not found' };
      }

      return { success: true, todo: todo.toObject() };
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return { success: false, error: 'Failed to update checklist item' };
    }
  }

  static async removeChecklistItem(todoId: string, itemId: string) {
    try {
      await connectDB();

      if (!todoId || !itemId) {
        return { success: false, error: 'Todo ID and item ID are required' };
      }

      const todo = await Todo.findByIdAndUpdate(
        todoId,
        { $pull: { checklist: { id: itemId } } },
        { new: true, runValidators: true }
      );

      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }

      return { success: true, todo: todo.toObject() };
    } catch (error) {
      console.error('Error removing checklist item:', error);
      return { success: false, error: 'Failed to remove checklist item' };
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
