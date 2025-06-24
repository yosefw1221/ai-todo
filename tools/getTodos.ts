import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const getTodosTool = tool({
  description:
    'Get all todos with optional filtering. Use this first when you need to delete todos to get their IDs.',
  parameters: z.object({
    filter: z
      .enum(['all', 'completed', 'pending'])
      .default('all')
      .describe('Filter todos by completion status'),
    priority: z
      .enum(['all', 'low', 'medium', 'high'])
      .default('all')
      .describe('Filter todos by priority'),
  }),
  execute: async ({ filter, priority }) => {
    const result = await TodoController.getAllTodos({
      filter,
      priority,
    });
    return result;
  },
});
