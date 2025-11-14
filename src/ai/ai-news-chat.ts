// src/ai/ai-news-chat.ts
'use server';
/**
 * @fileOverview An AI-powered news chat agent.
 *
 * - aiNewsChat - A function that handles the news chat process.
 * - AiNewsChatInput - The input type for the aiNewsChat function.
 * - AiNewsChatOutput - The return type for the aiNewsChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNewsChatInputSchema = z.object({
  articleHeadline: z.string().describe('The headline of the news article.'),
  articleContent: z.string().describe('The full content of the news article.'),
  userMessage: z.string().describe('The user message to the AI chatbot.'),
});
export type AiNewsChatInput = z.infer<typeof AiNewsChatInputSchema>;

const AiNewsChatOutputSchema = z.object({
  response: z.string().describe('The AI chatbot response to the user message.'),
});
export type AiNewsChatOutput = z.infer<typeof AiNewsChatOutputSchema>;

export async function aiNewsChat(input: AiNewsChatInput): Promise<AiNewsChatOutput> {
  return aiNewsChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiNewsChatPrompt',
  input: {schema: AiNewsChatInputSchema},
  output: {schema: AiNewsChatOutputSchema},
  prompt: `You are a helpful AI chatbot that discusses news articles with users.

  You have access to the headline and content of the article, as well as the user's message.
  Use this information to provide informative and engaging responses.

  Article Headline: {{{articleHeadline}}}
  Article Content: {{{articleContent}}}
  User Message: {{{userMessage}}}

  Response:`,
});

const aiNewsChatFlow = ai.defineFlow(
  {
    name: 'aiNewsChatFlow',
    inputSchema: AiNewsChatInputSchema,
    outputSchema: AiNewsChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
