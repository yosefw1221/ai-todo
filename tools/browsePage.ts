import { tool } from 'ai';
import { z } from 'zod';

export const browsePageTool = tool({
  description: 'Browse a web page and return the content',
  parameters: z.object({
    url: z.string().describe('The URL of the page to browse'),
  }),
  execute: async ({ url }) => {
    try {
      const result = await fetch(url);
      const text = await result.text();
      console.log(text);
      return text;
    } catch (error) {
      console.error(error);
      return 'Error browsing page';
    }
  },
});
