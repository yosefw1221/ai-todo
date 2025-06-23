import { tool } from 'ai';
import { z } from 'zod';
import { TodoController } from '@/controllers/todoController';

export const updateTodoChecklistItemTool = tool({
  description: 'Update the checklist items for a specific todo',
  parameters: z.object({
    id: z.string().describe('The ID of the todo to update the checklist for'),
    checklist: z.object({
      id: z.string().describe('The ID of the checklist item to update'),
      text: z.string().describe('The new text for the checklist item'),
      completed: z
        .boolean()
        .describe('Whether the checklist item is completed'),
    }),
  }),
  execute: async ({ id, checklist }) => {
    const result = await TodoController.updateChecklistItem(id, checklist);
    return result;
  },
});
