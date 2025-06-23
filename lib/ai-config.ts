import { openai } from '@ai-sdk/openai';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Export OpenAI client
export { openai };

// Default model configuration
export const AI_CONFIG = {
  model: 'gpt-3.5-turbo', // Default OpenAI model
  temperature: 0.7,
  maxTokens: 2000,
  frequencyPenalty: 0,
  presencePenalty: 0,
  topP: 1,
} as const;

// Available OpenAI models
export const OPENAI_MODELS = {
  GPT35_TURBO: 'gpt-3.5-turbo',
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo-preview',
} as const;
