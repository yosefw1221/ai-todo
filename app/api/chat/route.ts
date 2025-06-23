import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    messages,
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
          try {
            await dbConnect();
            const todo = new Todo({
              title,
              description,
              priority,
              completed: false,
            });
            await todo.save();
            return { success: true, todo: todo.toObject() };
          } catch (error) {
            return { success: false, error: 'Failed to create todo' };
          }
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
          try {
            await dbConnect();
            let query: any = {};

            if (filter === 'completed') {
              query.completed = true;
            } else if (filter === 'pending') {
              query.completed = false;
            }

            if (priority !== 'all') {
              query.priority = priority;
            }

            const todos = await Todo.find(query).sort({ createdAt: -1 });
            return {
              success: true,
              todos: todos.map((todo) => todo.toObject()),
            };
          } catch (error) {
            return { success: false, error: 'Failed to fetch todos' };
          }
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
          try {
            await dbConnect();
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (completed !== undefined) updateData.completed = completed;
            if (priority !== undefined) updateData.priority = priority;

            const todo = await Todo.findByIdAndUpdate(id, updateData, {
              new: true,
            });
            if (!todo) {
              return { success: false, error: 'Todo not found' };
            }
            return { success: true, todo: todo.toObject() };
          } catch (error) {
            return { success: false, error: 'Failed to update todo' };
          }
        },
      }),

      deleteTodo: tool({
        description: 'Delete a todo item',
        parameters: z.object({
          id: z.string().describe('The ID of the todo to delete'),
        }),
        execute: async ({ id }) => {
          try {
            await dbConnect();
            const todo = await Todo.findByIdAndDelete(id);
            if (!todo) {
              return { success: false, error: 'Todo not found' };
            }
            return { success: true, message: 'Todo deleted successfully' };
          } catch (error) {
            return { success: false, error: 'Failed to delete todo' };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
