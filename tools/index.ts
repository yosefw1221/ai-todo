// Export all AI tool calls
export { createTodoTool } from './createTodo';
export { getTodosTool } from './getTodos';
export { updateTodoTool } from './updateTodo';
export { deleteTodoTool } from './deleteTodo';
export { deleteMultipleTodosTool } from './deleteMultipleTodos';
export { getTodoChecklistsTool } from './getTodoChecklists';
export { updateTodoChecklistItemTool } from './updateTodoChecklistItem';

// Import all tools for the convenience object
import { createTodoTool } from './createTodo';
import { getTodosTool } from './getTodos';
import { updateTodoTool } from './updateTodo';
import { deleteTodoTool } from './deleteTodo';
import { deleteMultipleTodosTool } from './deleteMultipleTodos';
import { getTodoChecklistsTool } from './getTodoChecklists';
import { updateTodoChecklistItemTool } from './updateTodoChecklistItem';

// Convenience object for importing all tools at once
export const todoTools = {
  createTodo: createTodoTool,
  getTodos: getTodosTool,
  updateTodo: updateTodoTool,
  deleteTodo: deleteTodoTool,
  deleteMultipleTodos: deleteMultipleTodosTool,
  getTodoChecklists: getTodoChecklistsTool,
  updateTodoChecklistItem: updateTodoChecklistItemTool,
};
