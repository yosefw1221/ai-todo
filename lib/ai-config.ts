import { openai } from '@ai-sdk/openai';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Export OpenAI client
export { openai };

// Default model configuration
export const AI_CONFIG = {
  model: 'gpt-4o-mini', // GPT-4o Mini: 128k context, fast, affordable
  temperature: 0.7,
  maxTokens: 2000,
  frequencyPenalty: 0,
  presencePenalty: 0,
  topP: 1,
} as const;

// Available OpenAI models with context limits
export const OPENAI_MODELS = {
  GPT35_TURBO: 'gpt-3.5-turbo', // 16K tokens
  GPT4: 'gpt-4', // 8K tokens
  GPT4_TURBO: 'gpt-4-turbo', // 128K tokens
  GPT4O: 'gpt-4o', // 128K tokens (best performance)
  GPT4O_MINI: 'gpt-4o-mini', // 128K tokens (cost-effective)
} as const;
