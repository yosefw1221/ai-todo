import { createOpenAI } from '@ai-sdk/openai';

// Validate environment variables
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY environment variable is required');
}

if (!process.env.DEEPSEEK_BASE_URL) {
  throw new Error('DEEPSEEK_BASE_URL environment variable is required');
}

// Configure DeepSeek client with OpenAI-compatible interface
export const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
  // Additional headers that might be needed for DeepSeek
  headers: {
    'X-DashScope-SSE': 'enable',
    // Some DeepSeek deployments support this header to disable thinking
    'X-DeepSeek-Beta': 'no-thinking',
  },
});

// Default model configuration
export const AI_CONFIG = {
  model: 'deepseek-chat', // Default DeepSeek model
  temperature: 0.7,
  maxTokens: 2000,
  // Disable thinking/reasoning output
  frequencyPenalty: 0,
  presencePenalty: 0,
  topP: 1,
  // Additional parameters to control output
  stop: ['<think>', '<thinking>', '<reason>', '<reasoning>'],
} as const;

// Available DeepSeek models (update based on what DeepSeek provides)
export const DEEPSEEK_MODELS = {
  CHAT: 'deepseek-chat',
  CODER: 'deepseek-coder',
  // Add more models as needed
} as const;
