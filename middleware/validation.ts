import { NextRequest, NextResponse } from 'next/server';
import {
  CreateTodoRequest,
  UpdateTodoRequest,
  ChecklistItemUpdate,
} from '@/controllers/todoController';

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Basic validation functions
export const validateId = (
  id: string,
  fieldName: string = 'ID'
): ValidationError | null => {
  if (!id?.trim()) {
    return {
      field: fieldName.toLowerCase(),
      message: `${fieldName} is required`,
    };
  }
  return null;
};

export const validateTitle = (title: string): ValidationError | null => {
  if (!title?.trim()) {
    return { field: 'title', message: 'Title is required' };
  }
  if (title.trim().length > 200) {
    return {
      field: 'title',
      message: 'Title must be less than 200 characters',
    };
  }
  return null;
};

export const validateDescription = (
  description?: string
): ValidationError | null => {
  if (description && description.length > 1000) {
    return {
      field: 'description',
      message: 'Description must be less than 1000 characters',
    };
  }
  return null;
};

export const validatePriority = (priority?: string): ValidationError | null => {
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return {
      field: 'priority',
      message: 'Priority must be low, medium, or high',
    };
  }
  return null;
};

export const validateChecklistItem = (item: {
  text: string;
  completed?: boolean;
}): ValidationError | null => {
  if (!item.text?.trim()) {
    return { field: 'checklist', message: 'Checklist item text is required' };
  }
  if (item.text.trim().length > 200) {
    return {
      field: 'checklist',
      message: 'Checklist item text must be less than 200 characters',
    };
  }
  return null;
};

// Complex validation functions
export const validateCreateTodoRequest = (
  data: CreateTodoRequest
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate title
  const titleError = validateTitle(data.title);
  if (titleError) errors.push(titleError);

  // Validate description
  const descriptionError = validateDescription(data.description);
  if (descriptionError) errors.push(descriptionError);

  // Validate priority
  const priorityError = validatePriority(data.priority);
  if (priorityError) errors.push(priorityError);

  // Validate checklist items
  if (data.checklist) {
    data.checklist.forEach((item, index) => {
      const itemError = validateChecklistItem(item);
      if (itemError) {
        errors.push({
          field: `checklist[${index}]`,
          message: itemError.message,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateTodoRequest = (
  data: UpdateTodoRequest
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate title if provided
  if (data.title !== undefined) {
    const titleError = validateTitle(data.title);
    if (titleError) errors.push(titleError);
  }

  // Validate description if provided
  if (data.description !== undefined) {
    const descriptionError = validateDescription(data.description);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate priority if provided
  if (data.priority !== undefined) {
    const priorityError = validatePriority(data.priority);
    if (priorityError) errors.push(priorityError);
  }

  // Validate checklist items if provided
  if (data.checklist) {
    data.checklist.forEach((item, index) => {
      const idError = validateId(item.id, 'Checklist item ID');
      if (idError) {
        errors.push({
          field: `checklist[${index}].id`,
          message: idError.message,
        });
      }

      const itemError = validateChecklistItem({
        text: item.text,
        completed: item.completed,
      });
      if (itemError) {
        errors.push({
          field: `checklist[${index}]`,
          message: itemError.message,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateChecklistItemUpdate = (
  data: ChecklistItemUpdate
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate ID
  const idError = validateId(data.id, 'Item ID');
  if (idError) errors.push(idError);

  // Validate text if provided
  if (data.text !== undefined) {
    const textError = validateChecklistItem({ text: data.text });
    if (textError) errors.push(textError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Middleware functions
export const withValidation = <T>(
  validationFn: (data: T) => ValidationResult
) => {
  return (data: T) => {
    const result = validationFn(data);
    if (!result.isValid) {
      return {
        success: false,
        error: result.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', '),
        validationErrors: result.errors,
      };
    }
    return { success: true };
  };
};

// Request validation middleware
export const validateTodoId = (id: string) => {
  const error = validateId(id, 'Todo ID');
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return { success: true };
};

export const validateItemId = (id: string) => {
  const error = validateId(id, 'Item ID');
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return { success: true };
};

// Utility functions
export const sanitizeString = (str?: string): string | undefined => {
  return str?.trim() || undefined;
};

export const sanitizeCreateTodoRequest = (
  data: CreateTodoRequest
): CreateTodoRequest => {
  return {
    title: data.title.trim(),
    description: sanitizeString(data.description),
    priority: data.priority || 'medium',
    checklist:
      data.checklist?.map((item) => ({
        text: item.text.trim(),
        completed: item.completed || false,
      })) || [],
  };
};

export const sanitizeUpdateTodoRequest = (
  data: UpdateTodoRequest
): UpdateTodoRequest => {
  const sanitized: UpdateTodoRequest = {};

  if (data.title !== undefined) {
    sanitized.title = sanitizeString(data.title);
  }
  if (data.description !== undefined) {
    sanitized.description = sanitizeString(data.description);
  }
  if (data.completed !== undefined) {
    sanitized.completed = data.completed;
  }
  if (data.priority !== undefined) {
    sanitized.priority = data.priority;
  }
  if (data.checklist !== undefined) {
    sanitized.checklist = data.checklist;
  }

  return sanitized;
};
