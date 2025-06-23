import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const getTodoChecklistsTool = tool({
  description: 'Get the checklist items for a specific todo',
  parameters: z.object({
    id: z.string().describe('The ID of the todo to get the checklist for'),
  }),
  execute: async ({ id }) => {
    const result = await TodoController.getTodoById(id);
    return result.success ? result.todo?.checklist : [];
  },
});
