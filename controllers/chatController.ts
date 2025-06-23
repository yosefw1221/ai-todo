import { streamText, tool } from 'ai';
import { z } from 'zod';
import { openai, AI_CONFIG } from '@/lib/ai-config';
import { TodoController } from './todoController';

export class ChatController {
  static async handleChatRequest(messages: any[]) {
    const result = await streamText({
      model: openai(AI_CONFIG.model),
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
      
      Examples of what you can help with:
      - "Add a task" -> use createTodo
      - "Show my todos" -> use getTodos 
      - "Mark X as done" -> use updateTodo
      - "Delete completed tasks" -> use getTodos then deleteTodo for each
      - "What's my high priority tasks?" -> use getTodos with priority filter
      
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
          description: 'Get all todos with optional filtering',
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
          description: 'Delete a todo item',
          parameters: z.object({
            id: z.string().describe('The ID of the todo to delete'),
          }),
          execute: async ({ id }) => {
            const result = await TodoController.deleteTodo(id);
            return result;
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  }
}
