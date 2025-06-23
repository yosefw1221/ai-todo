import { tool } from 'ai';
import { z } from 'zod';

export const calculatorTool = tool({
  description: 'Calculate the result of a mathematical expression',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to calculate'),
    type: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The type of calculation to perform'),
  }),
  execute: async ({ expression, type }) => {
    const result = eval(expression);
    return result;
  },
});
