import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const updateTodoTool = tool({
  description: 'Update a todo item',
  parameters: z.object({
    id: z.string().describe('The ID of the todo to update'),
    title: z.string().optional().describe('New title for the todo'),
    description: z.string().optional().describe('New description for the todo'),
    completed: z.boolean().optional().describe('Whether the todo is completed'),
    priority: z
      .enum(['low', 'medium', 'high'])
      .optional()
      .describe('New priority level'),
  }),
  execute: async ({ id, title, description, completed, priority }) => {
    const result = await TodoController.updateTodo(id, {
      title,
      description,
      completed,
      priority,
    });
    return result;
  },
});
