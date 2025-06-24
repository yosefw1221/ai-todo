import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const deleteMultipleTodosTool = tool({
  description:
    'Delete multiple todos at once by their IDs. Use this for bulk deletion.',
  parameters: z.object({
    ids: z
      .array(z.string())
      .describe('Array of todo IDs to delete (get these from getTodos first)'),
  }),
  execute: async ({ ids }) => {
    console.log(
      `AI attempting to delete multiple todos with IDs: ${ids.join(', ')}`
    );
    const results = [];
    const deletedTodos = [];
    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      // Get todo details before deletion
      const todoDetails = await TodoController.getTodoById(id);
      const result = await TodoController.deleteTodo(id);

      results.push({
        id,
        result,
        todoDetails: todoDetails.success ? todoDetails.data : null,
      });

      if (result.success) {
        successCount++;
        if (todoDetails.success) {
          deletedTodos.push(todoDetails.data);
        }
      } else {
        failCount++;
      }
    }

    const summary = {
      success: failCount === 0,
      message: `Successfully deleted ${successCount} todo${
        successCount !== 1 ? 's' : ''
      }${failCount > 0 ? `, ${failCount} failed` : ''}`,
      details: results,
      deletedTodos,
      successCount,
      failCount,
      action: 'bulk_delete',
      timestamp: new Date().toISOString(),
    };

    console.log(`Bulk delete result:`, summary);
    return summary;
  },
});
