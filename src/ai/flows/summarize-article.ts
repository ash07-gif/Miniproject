'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing news articles.
 *
 * - summarizeArticle - A function that takes an article URL and returns a summary.
 * - SummarizeArticleInput - The input type for the summarizeArticle function (article URL).
 * - SummarizeArticleOutput - The return type for the summarizeArticle function (article summary).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleUrl: z.string().describe('URL of the article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A short summary of the article.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `Summarize the news article at the following URL: {{{articleUrl}}}. Provide a concise summary.`, 
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
