import { LanguageModelV1, streamText } from 'ai';
import { openai, AI_CONFIG } from '@/lib/ai-config';
import { todoTools } from '@/tools';

export class ChatController {
  static async handleChatRequest(messages: any[]) {
    // Truncate messages to prevent context length issues
    const truncatedMessages = this.truncateMessages(messages, 12000); // Keep under 12k tokens for safety

    const result = await streamText({
      model: openai(AI_CONFIG.model as any) as LanguageModelV1,
      messages: truncatedMessages,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
      frequencyPenalty: AI_CONFIG.frequencyPenalty,
      presencePenalty: AI_CONFIG.presencePenalty,
      topP: AI_CONFIG.topP,
      maxToolRoundtrips: 5,

      system: `You are a helpful AI assistant that manages a todo list. You can create, read, update, and delete todos using the available tools. 

      ⚠️ CRITICAL RULE: After EVERY tool execution, you MUST continue the conversation with a text response explaining what happened. Do NOT stop after tool calls - always provide a follow-up message.

      📝 FORMATTING: Use **markdown formatting** in your responses to make them more readable:
      - Use **bold** for important information
      - Use \`code\` for todo titles and technical terms
      - Use bullet points (- ) for lists
      - Use emojis for better visual appeal
      - Use headers (##) for organizing longer responses

      WORKFLOW FOR ALL OPERATIONS:
      1. Execute the necessary tool(s)
      2. IMMEDIATELY follow with a conversational message explaining the results
      3. Be specific about what was accomplished
      4. Format your response with markdown for better readability

      DELETION PROCESS:
      1. Use getTodos to find todos and their IDs
      2. Use deleteTodo or deleteMultipleTodos with the IDs
      3. MANDATORY: Provide a conversational response like "✅ **Success!** I've deleted **[X] todo(s)**:\n- \`[title 1]\`\n- \`[title 2]\`"

      REQUIRED RESPONSE FORMATS:
      - After successful deletion: "✅ **Done!** I've deleted **[X] todo(s)**:\n- \`[list titles]\`"
      - After failed deletion: "❌ **Error:** I couldn't delete the todo: [reason]"
      - After no todos found: "ℹ️ **Info:** I didn't find any todos matching that criteria"
      - After creation: "✅ **Created** a new todo: \`[title]\` with **[priority]** priority"
      - After update: "✅ **Updated** the todo: [what changed]"
      - When showing todos: Use bullet points and format nicely

      EXAMPLES:
      User: "Delete completed tasks"
      Assistant: [uses getTodos] → [uses deleteTodo] → "✅ **Success!** I've deleted **2 completed todos**:\n- \`Buy groceries\`\n- \`Call dentist\`"

      User: "Add a task to read a book"  
      Assistant: [uses createTodo] → "✅ **Created** a new todo: \`Read a book\` with **medium** priority"

      User: "Show my todos"
      Assistant: [uses getTodos] → "## Your Todos\n\n**Pending Tasks:**\n- 🔴 \`Important meeting\` (high priority)\n- 🟡 \`Review code\` (medium priority)\n\n**Completed:**\n- ✅ \`Buy groceries\`"

      Priority levels: low, medium, high
      Todo status: completed (true/false)

      Remember: NEVER end your response with just tool calls. Always add a conversational message with markdown formatting explaining what happened!`,

      tools: todoTools,
    });

    return result.toDataStreamResponse();
  }

  private static truncateMessages(messages: any[], maxTokens: number): any[] {
    // Simple token estimation: ~4 characters per token
    const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

    let totalTokens = 0;
    const truncatedMessages = [];

    // Always keep the system message if it exists
    if (messages.length > 0 && messages[0].role === 'system') {
      truncatedMessages.push(messages[0]);
      totalTokens += estimateTokens(JSON.stringify(messages[0]));
    }

    // Add messages from the end (most recent first) until we hit the limit
    for (
      let i = messages.length - 1;
      i >= (messages[0]?.role === 'system' ? 1 : 0);
      i--
    ) {
      const messageTokens = estimateTokens(JSON.stringify(messages[i]));

      if (totalTokens + messageTokens > maxTokens) {
        break;
      }

      totalTokens += messageTokens;
      truncatedMessages.unshift(messages[i]);
    }

    // Ensure we keep at least the last user message
    if (truncatedMessages.length < 2 && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (!truncatedMessages.includes(lastMessage)) {
        truncatedMessages.push(lastMessage);
      }
    }

    return truncatedMessages;
  }
}
