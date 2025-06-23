import { tool } from 'ai';
import { z } from 'zod';

export const browserTool = tool({
  description: 'Browse a web page and return the content',
  parameters: z.object({
    url: z.string().describe('The URL of the page to browse'),
  }),
  execute: async ({ url }) => {
    try {
      const result = await fetch(url);
      const status = result.status;
      if ([2, 3].includes(Math.floor(status / 100))) {
        const text = await result.text();
        return text;
      }
      return `Error browsing page: ${status} ${result.statusText}`;
    } catch (error) {
      console.error(error);
      return `Error browsing page: ${error}`;
    }
  },
});
