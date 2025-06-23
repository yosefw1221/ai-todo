import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const createTodoTool = tool({
  description: 'Create a new todo item with optional checklist',
  parameters: z.object({
    title: z.string().describe('The title of the todo'),
    description: z
      .string()
      .optional()
      .describe('Optional description of the todo'),
    priority: z
      .enum(['low', 'medium', 'high'])
      .default('medium')
      .describe('Priority level of the todo'),
    checklist: z
      .array(
        z.object({
          text: z.string().describe('Checklist item text'),
          completed: z
            .boolean()
            .default(false)
            .describe('Whether the item is completed'),
        })
      )
      .optional()
      .describe('Optional checklist items for the todo'),
  }),
  execute: async ({ title, description, priority, checklist }) => {
    const result = await TodoController.createTodo({
      title,
      description,
      priority,
      checklist,
    });
    return result;
  },
});
