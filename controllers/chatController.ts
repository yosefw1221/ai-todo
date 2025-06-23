import { streamText, tool } from 'ai';
import { z } from 'zod';
import { openai, AI_CONFIG } from '@/lib/ai-config';
import { TodoController } from './todoController';

export class ChatController {
  static async handleChatRequest(messages: any[]) {
    const result = await streamText({
      model: openai(AI_CONFIG.model as any),
      messages,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
      frequencyPenalty: AI_CONFIG.frequencyPenalty,
      presencePenalty: AI_CONFIG.presencePenalty,
      topP: AI_CONFIG.topP,
      maxToolRoundtrips: 5,

      system: `You are a helpful AI assistant that manages a todo list. You can create, read, update, and delete todos using the available tools. 

      ⚠️ CRITICAL RULE: After EVERY tool execution, you MUST continue the conversation with a text response explaining what happened. Do NOT stop after tool calls - always provide a follow-up message.

      WORKFLOW FOR ALL OPERATIONS:
      1. Execute the necessary tool(s)
      2. IMMEDIATELY follow with a conversational message explaining the results
      3. Be specific about what was accomplished

      DELETION PROCESS:
      1. Use getTodos to find todos and their IDs
      2. Use deleteTodo or deleteMultipleTodos with the IDs
      3. MANDATORY: Provide a conversational response like "✅ I've successfully deleted [X] todo(s): [list their titles]"

      REQUIRED RESPONSE FORMATS:
      - After successful deletion: "✅ Done! I've deleted [X] todo(s): [list titles]"
      - After failed deletion: "❌ I couldn't delete the todo: [reason]"
      - After no todos found: "ℹ️ I didn't find any todos matching that criteria"
      - After creation: "✅ Created a new todo: [title]"
      - After update: "✅ Updated the todo: [what changed]"

      EXAMPLES:
      User: "Delete completed tasks"
      Assistant: [uses getTodos] → [uses deleteTodo] → "✅ Done! I've deleted 2 completed todos: 'Buy groceries' and 'Call dentist'"

      User: "Add a task to read a book"  
      Assistant: [uses createTodo] → "✅ Created a new todo: 'Read a book' with medium priority"

      Priority levels: low, medium, high
      Todo status: completed (true/false)

      Remember: NEVER end your response with just tool calls. Always add a conversational message explaining what happened!`,
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
                todoDetails: todoDetails.success ? todoDetails.todo : null,
              });

              if (result.success) {
                successCount++;
                if (todoDetails.success) {
                  deletedTodos.push(todoDetails.todo);
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
        }),
      },
    });

    return result.toDataStreamResponse();
  }
}
