/**
 * Removes thinking patterns from AI responses
 * DeepSeek sometimes includes reasoning in responses even when configured not to
 */
export function removeThinkingPatterns(text: string): string {
  // Remove content between thinking tags
  const thinkingPatterns = [
    /<think>[\s\S]*?<\/think>/gi,
    /<thinking>[\s\S]*?<\/thinking>/gi,
    /<reason>[\s\S]*?<\/reason>/gi,
    /<reasoning>[\s\S]*?<\/reasoning>/gi,
    /\*\*Thinking:\*\*[\s\S]*?(?=\n\n|\*\*|$)/gi,
    /\*\*Reasoning:\*\*[\s\S]*?(?=\n\n|\*\*|$)/gi,
    // Remove lines that start with "Let me think" or similar
    /^Let me think.*$/gim,
    /^I'll think about this.*$/gim,
    /^My reasoning.*$/gim,
    /^Step by step.*$/gim,
  ];

  let cleanedText = text;

  thinkingPatterns.forEach((pattern) => {
    cleanedText = cleanedText.replace(pattern, '');
  });

  // Clean up extra whitespace and newlines
  return cleanedText
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
    .trim();
}

/**
 * Post-process AI responses to ensure clean output
 */
export function cleanAIResponse(response: string): string {
  let cleaned = removeThinkingPatterns(response);

  // Remove any remaining artifacts
  cleaned = cleaned
    .replace(/^[\s\n]*/, '') // Remove leading whitespace
    .replace(/[\s\n]*$/, '') // Remove trailing whitespace
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines

  return cleaned;
}
