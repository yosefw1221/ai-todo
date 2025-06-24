import { ensureConnection } from '@/lib/db';
import Todo, { ITodo, IChecklistItem } from '@/models/Todo';
import { v4 as uuidv4 } from 'uuid';
import {
  validateCreateTodoRequest,
  validateUpdateTodoRequest,
  validateChecklistItemUpdate,
  validateTodoId,
  validateItemId,
  sanitizeCreateTodoRequest,
  sanitizeUpdateTodoRequest,
  ValidationError,
} from '@/middleware/validation';

// Types
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

export interface TodoResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  validationErrors?: ValidationError[];
}

// Helper functions
const buildTodoQuery = (filters: TodoFilters): any => {
  const query: any = {};

  if (filters.filter === 'completed') {
    query.completed = true;
  } else if (filters.filter === 'pending') {
    query.completed = false;
  }

  if (filters.priority && filters.priority !== 'all') {
    query.priority = filters.priority;
  }

  return query;
};

const processChecklistItems = (
  checklist: { text: string; completed?: boolean }[]
): IChecklistItem[] => {
  return checklist.map((item) => ({
    id: uuidv4(),
    text: item.text.trim(),
    completed: item.completed || false,
    createdAt: new Date(),
  }));
};

export class TodoController {
  /**
   * Get all todos with optional filtering
   */
  static async getAllTodos(
    filters: TodoFilters = {}
  ): Promise<TodoResponse<ITodo[]>> {
    try {
      await ensureConnection();

      const query = buildTodoQuery(filters);
      const todos = await Todo.find(query).sort({ createdAt: -1 }).lean();

      return {
        success: true,
        data: todos as unknown as ITodo[],
      };
    } catch (error) {
      console.error('Error fetching todos:', error);
      return {
        success: false,
        error: 'Failed to fetch todos',
      };
    }
  }

  /**
   * Create a new todo
   */
  static async createTodo(
    todoData: CreateTodoRequest
  ): Promise<TodoResponse<ITodo>> {
    try {
      await ensureConnection();

      // Validate input
      const validation = validateCreateTodoRequest(todoData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', '),
          validationErrors: validation.errors,
        };
      }

      // Sanitize input
      const sanitizedData = sanitizeCreateTodoRequest(todoData);
      const processedChecklist = processChecklistItems(
        sanitizedData.checklist || []
      );

      const todo = new Todo({
        title: sanitizedData.title,
        description: sanitizedData.description,
        priority: sanitizedData.priority,
        completed: false,
        checklist: processedChecklist,
      });

      const savedTodo = await todo.save();

      return {
        success: true,
        data: savedTodo.toObject(),
        message: 'Todo created successfully',
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      return {
        success: false,
        error: 'Failed to create todo',
      };
    }
  }

  /**
   * Update an existing todo
   */
  static async updateTodo(
    id: string,
    updateData: UpdateTodoRequest
  ): Promise<TodoResponse<ITodo>> {
    try {
      await ensureConnection();

      // Validate ID
      const idValidation = validateTodoId(id);
      if (!idValidation.success) {
        return {
          success: false,
          error: idValidation.error,
        };
      }

      // Validate update data
      const dataValidation = validateUpdateTodoRequest(updateData);
      if (!dataValidation.isValid) {
        return {
          success: false,
          error: dataValidation.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', '),
          validationErrors: dataValidation.errors,
        };
      }

      // Sanitize update data
      const sanitizedData = sanitizeUpdateTodoRequest(updateData);

      const todo = await Todo.findByIdAndUpdate(id, sanitizedData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      return {
        success: true,
        data: todo as unknown as ITodo,
        message: 'Todo updated successfully',
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return {
        success: false,
        error: 'Failed to update todo',
      };
    }
  }

  /**
   * Get a todo by ID
   */
  static async getTodoById(id: string): Promise<TodoResponse<ITodo>> {
    try {
      await ensureConnection();

      // Validate ID
      const validation = validateTodoId(id);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const todo = await Todo.findById(id).lean();

      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      return {
        success: true,
        data: todo as unknown as ITodo,
      };
    } catch (error) {
      console.error('Error fetching todo:', error);
      return {
        success: false,
        error: 'Failed to fetch todo',
      };
    }
  }

  /**
   * Delete a todo
   */
  static async deleteTodo(id: string): Promise<TodoResponse> {
    try {
      await ensureConnection();

      // Validate ID
      const validation = validateTodoId(id);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
        };
      }

      const todo = await Todo.findByIdAndDelete(id);

      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      return {
        success: true,
        message: 'Todo deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting todo:', error);
      return {
        success: false,
        error: 'Failed to delete todo',
      };
    }
  }

  /**
   * Add a checklist item to a todo
   */
  static async addChecklistItem(
    todoId: string,
    itemText: string
  ): Promise<TodoResponse<{ todo: ITodo; addedItem: IChecklistItem }>> {
    try {
      await ensureConnection();

      // Validate inputs
      const idValidation = validateTodoId(todoId);
      if (!idValidation.success) {
        return {
          success: false,
          error: idValidation.error,
        };
      }

      if (!itemText?.trim()) {
        return {
          success: false,
          error: 'Item text is required',
        };
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
      ).lean();

      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      return {
        success: true,
        data: { todo: todo as unknown as ITodo, addedItem: newItem },
        message: 'Checklist item added successfully',
      };
    } catch (error) {
      console.error('Error adding checklist item:', error);
      return {
        success: false,
        error: 'Failed to add checklist item',
      };
    }
  }

  /**
   * Update a checklist item
   */
  static async updateChecklistItem(
    todoId: string,
    itemUpdate: ChecklistItemUpdate
  ): Promise<TodoResponse<ITodo>> {
    try {
      await ensureConnection();

      // Validate todo ID
      const todoIdValidation = validateTodoId(todoId);
      if (!todoIdValidation.success) {
        return {
          success: false,
          error: todoIdValidation.error,
        };
      }

      // Validate item update
      const itemValidation = validateChecklistItemUpdate(itemUpdate);
      if (!itemValidation.isValid) {
        return {
          success: false,
          error: itemValidation.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', '),
          validationErrors: itemValidation.errors,
        };
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
      ).lean();

      if (!todo) {
        return {
          success: false,
          error: 'Todo or checklist item not found',
        };
      }

      return {
        success: true,
        data: todo as unknown as ITodo,
        message: 'Checklist item updated successfully',
      };
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return {
        success: false,
        error: 'Failed to update checklist item',
      };
    }
  }

  /**
   * Remove a checklist item from a todo
   */
  static async removeChecklistItem(
    todoId: string,
    itemId: string
  ): Promise<TodoResponse<ITodo>> {
    try {
      await ensureConnection();

      // Validate IDs
      const todoIdValidation = validateTodoId(todoId);
      if (!todoIdValidation.success) {
        return {
          success: false,
          error: todoIdValidation.error,
        };
      }

      const itemIdValidation = validateItemId(itemId);
      if (!itemIdValidation.success) {
        return {
          success: false,
          error: itemIdValidation.error,
        };
      }

      const todo = await Todo.findByIdAndUpdate(
        todoId,
        { $pull: { checklist: { id: itemId } } },
        { new: true, runValidators: true }
      ).lean();

      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      return {
        success: true,
        data: todo as unknown as ITodo,
        message: 'Checklist item removed successfully',
      };
    } catch (error) {
      console.error('Error removing checklist item:', error);
      return {
        success: false,
        error: 'Failed to remove checklist item',
      };
    }
  }
}
