import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const deleteTodoTool = tool({
  description:
    'Delete a specific todo item by its ID. You must first use getTodos to find the todo ID before deleting.',
  parameters: z.object({
    id: z
      .string()
      .describe(
        'The exact ID of the todo to delete (get this from getTodos first)'
      ),
  }),
  execute: async ({ id }) => {
    console.log(`AI attempting to delete todo with ID: ${id}`);

    // First get the todo details before deleting
    const todoDetails = await TodoController.getTodoById(id);
    const result = await TodoController.deleteTodo(id);

    // Enhance the response with more context
    const enhancedResult = {
      ...result,
      deletedTodo: todoDetails.success ? todoDetails.todo : null,
      action: 'delete',
      timestamp: new Date().toISOString(),
    };

    console.log(`Delete result:`, enhancedResult);
    return enhancedResult;
  },
});
