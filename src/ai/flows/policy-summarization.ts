'use server';

/**
 * @fileOverview Summarizes lengthy policy documents into concise summaries.
 *
 * - summarizePolicy - A function that handles the policy summarization process.
 * - SummarizePolicyInput - The input type for the summarizePolicy function.
 * - SummarizePolicyOutput - The return type for the summarizePolicy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePolicyInputSchema = z.object({
  policyDocument: z
    .string()
    .describe('The lengthy policy document to be summarized.'),
});
export type SummarizePolicyInput = z.infer<typeof SummarizePolicyInputSchema>;

const SummarizePolicyOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the policy document.'),
});
export type SummarizePolicyOutput = z.infer<typeof SummarizePolicyOutputSchema>;

export async function summarizePolicy(input: SummarizePolicyInput): Promise<SummarizePolicyOutput> {
  return summarizePolicyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePolicyPrompt',
  input: {schema: SummarizePolicyInputSchema},
  output: {schema: SummarizePolicyOutputSchema},
  prompt: `You are an expert policy summarizer. Your task is to distill long policy documents into concise summaries that cover all key points.

The summary must be no more than 200 words and formatted into clean, well-structured paragraphs with a blank line separating them.

Here is an example of a good summary:

The company's updated remote work policy provides employees with the flexibility to work from home, a co-working space, or the office, subject to manager approval. To be eligible, employees must have been with the company for at least six months and maintain a satisfactory performance record.

Requests for remote work arrangements must be submitted through the internal HR portal at least two weeks in advance. The company will provide essential equipment, but employees are responsible for ensuring a safe and productive home office environment.

---

Now, please summarize the following policy document.

Policy Document:
{{{policyDocument}}}`,
});

const summarizePolicyFlow = ai.defineFlow(
  {
    name: 'summarizePolicyFlow',
    inputSchema: SummarizePolicyInputSchema,
    outputSchema: SummarizePolicyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
