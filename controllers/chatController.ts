import { LanguageModelV1, streamText, tool } from 'ai';
import { z } from 'zod';
import { openai, AI_CONFIG } from '@/lib/ai-config';
import { TodoController } from './todoController';

export class ChatController {
  static async handleChatRequest(messages: any[]) {
    const result = await streamText({
      model: openai(AI_CONFIG.model) as LanguageModelV1,
      messages,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
      frequencyPenalty: AI_CONFIG.frequencyPenalty,
      presencePenalty: AI_CONFIG.presencePenalty,
      topP: AI_CONFIG.topP,

      system: `You are a helpful AI assistant that manages a todo list. You can create, read, update, and delete todos using the available tools. 
      
      When users ask about todos, be conversational and helpful. Always confirm actions you've taken and provide clear feedback about the results.
      
      Priority levels are: low, medium, high
      Todo status can be: completed (true/false)
      
      IMPORTANT DELETION WORKFLOW:
      To delete todos, you MUST:
      1. First use getTodos to find the todos and their IDs
      2. Then use deleteTodo with the specific todo ID(s)
      3. Always confirm what was deleted
      
      Examples of what you can help with:
      - "Add a task" -> use createTodo
      - "Show my todos" -> use getTodos 
      - "Mark X as done" -> use updateTodo
      - "Delete completed tasks" -> use getTodos with filter="completed", then deleteTodo for each ID
      - "Delete the grocery todo" -> use getTodos to find it, then deleteTodo with the ID
      - "Remove all high priority tasks" -> use getTodos with priority="high", then deleteTodo for each ID
      - "What's my high priority tasks?" -> use getTodos with priority filter
      
      When deleting multiple todos, delete them one by one and report progress.
      
      Always be friendly and explain what you're doing when you use tools.`,
      tools: {
        createTodo: tool({
          description: 'Create a new todo item',
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
          }),
          execute: async ({ title, description, priority }) => {
            const result = await TodoController.createTodo({
              title,
              description,
              priority,
            });
            return result;
          },
        }),

        getTodos: tool({
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
            console.log(
              `AI fetching todos with filter: ${filter}, priority: ${priority}`
            );
            const result = await TodoController.getAllTodos({
              filter,
              priority,
            });
            console.log(
              `Found ${result.success ? result.todos?.length || 0 : 0} todos`
            );
            return result;
          },
        }),

        updateTodo: tool({
          description: 'Update a todo item',
          parameters: z.object({
            id: z.string().describe('The ID of the todo to update'),
            title: z.string().optional().describe('New title for the todo'),
            description: z
              .string()
              .optional()
              .describe('New description for the todo'),
            completed: z
              .boolean()
              .optional()
              .describe('Whether the todo is completed'),
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
        }),

        deleteTodo: tool({
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
            const result = await TodoController.deleteTodo(id);
            console.log(`Delete result:`, result);
            return result;
          },
        }),

        deleteMultipleTodos: tool({
          description:
            'Delete multiple todos at once by their IDs. Use this for bulk deletion.',
          parameters: z.object({
            ids: z
              .array(z.string())
              .describe(
                'Array of todo IDs to delete (get these from getTodos first)'
              ),
          }),
          execute: async ({ ids }) => {
            console.log(
              `AI attempting to delete multiple todos with IDs: ${ids.join(
                ', '
              )}`
            );
            const results = [];
            let successCount = 0;
            let failCount = 0;

            for (const id of ids) {
              const result = await TodoController.deleteTodo(id);
              results.push({ id, result });
              if (result.success) {
                successCount++;
              } else {
                failCount++;
              }
            }

            const summary = {
              success: failCount === 0,
              message: `Deleted ${successCount} todos successfully${
                failCount > 0 ? `, ${failCount} failed` : ''
              }`,
              details: results,
              successCount,
              failCount,
            };

            console.log(`Bulk delete result:`, summary);
            return summary;
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  }
}
