'use server';

/**
 * @fileOverview A company policy inquiry AI agent.
 *
 * - policyInquiry - A function that handles the policy inquiry process.
 * - PolicyInquiryInput - The input type for the policyInquiry function.
 * - PolicyInquiryOutput - The return type for the policyInquiry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PolicyInquiryInputSchema = z.object({
  query: z.string().describe('The question about company policies.'),
});
export type PolicyInquiryInput = z.infer<typeof PolicyInquiryInputSchema>;

const PolicyInquiryOutputSchema = z.object({
  answer: z.string().describe('The answer to the policy inquiry question.'),
});
export type PolicyInquiryOutput = z.infer<typeof PolicyInquiryOutputSchema>;

export async function policyInquiry(input: PolicyInquiryInput): Promise<PolicyInquiryOutput> {
  return policyInquiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'policyInquiryPrompt',
  input: {schema: PolicyInquiryInputSchema},
  output: {schema: PolicyInquiryOutputSchema},
  prompt: `You are a helpful assistant that answers questions about company policies.

  Use the following information to answer the question:
  {{query}}`,
});

const policyInquiryFlow = ai.defineFlow(
  {
    name: 'policyInquiryFlow',
    inputSchema: PolicyInquiryInputSchema,
    outputSchema: PolicyInquiryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
