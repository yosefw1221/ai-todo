import { tool } from 'ai';
import { z } from 'zod';
import { search } from 'google-sr';

export const googlesearchTool = tool({
  description: 'Search the web for information using Google',
  parameters: z.object({
    query: z.string().describe('The search query to look up'),
    limit: z
      .number()
      .optional()
      .describe('Number of results to return (default: 10)'),
  }),
  execute: async ({ query, limit = 10 }) => {
    try {
      const results = await search({
        query,
        requestConfig: {
          params: {
            num: limit,
            hl: 'en',
            gl: 'us',
          },
        },
      });

      // Format results for better readability
      const formattedResults = results.slice(0, limit).map((result, index) => ({
        position: index + 1,
        title: result.title,
        link: result.link,
        snippet: result.description,
      }));

      return {
        query,
        resultsCount: formattedResults.length,
        results: formattedResults,
      };
    } catch (error) {
      return {
        error: `Search failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        query,
        resultsCount: 0,
        results: [],
      };
    }
  },
});
